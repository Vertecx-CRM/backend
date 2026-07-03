import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import { SalesService } from 'src/sales/sales.service';
import { resolveUserIdFromAuth } from 'src/shared/utils/resolve-user-id';

type WompiCheckoutSession = {
  saleId: number;
  saleCode: string;
  wompiEnv: 'sandbox' | 'production';
  publicKey: string;
  currency: 'COP';
  amountInCents: number;
  reference: string;
  redirectUrl?: string;
  expirationTime: string;
  signature: {
    integrity: string;
  };
  customerData?: {
    email?: string;
    fullName?: string;
    phoneNumber?: string;
    phoneNumberPrefix?: string;
    legalId?: string;
    legalIdType?: string;
  };
  shippingAddress?: {
    addressLine1?: string;
    city?: string;
    phoneNumber?: string;
    region?: string;
    country?: string;
  };
};

type WompiTransactionData = {
  id?: string;
  status?: string;
  status_message?: string;
  amount_in_cents?: number;
  reference?: string;
  currency?: string;
  payment_method_type?: string;
  finalized_at?: string;
  created_at?: string;
};

type WompiEventPayload = {
  event?: string;
  environment?: 'test' | 'prod' | string;
  timestamp?: number | string;
  data?: {
    transaction?: WompiTransactionData;
    [key: string]: any;
  };
  signature?: {
    properties?: string[];
    checksum?: string;
  };
  [key: string]: any;
};

const WOMPI_REFERENCE_PREFIX = 'VERTECX-SALE';
const WOMPI_TRANSACTION_SUCCESS = 'APPROVED';
@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly salesService: SalesService,
  ) {}

  async createWompiCheckoutSession(
    user: any,
    saleId: number,
    redirectUrl?: string,
  ): Promise<WompiCheckoutSession> {
    const sale = await this.salesService.findOne(saleId);
    this.ensureSaleOwnership(sale, user);
    this.ensureCheckoutAllowed(sale);

    const publicKey = this.getRequiredConfig('WOMPI_PUBLIC_KEY');
    const integritySecret = this.getRequiredConfig('WOMPI_INTEGRITY_SECRET');
    this.ensureWompiConfigMatchesEnv({
      publicKey,
      integritySecret,
    });

    const amountInCents = this.getSaleAmountInCents(sale);
    const reference = this.buildReference(saleId);
    const expirationTime = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    const safeRedirectUrl = this.resolveRedirectUrl(redirectUrl, saleId, reference);
    const integrity = this.sha256(
      `${reference}${amountInCents}COP${expirationTime}${integritySecret}`,
    );

    await this.salesService.update(saleId, {
      paymentmethod: 'Transfer',
    } as any);

    return {
      saleId,
      saleCode: String(sale?.salecode ?? ''),
      wompiEnv: this.getWompiEnv(),
      publicKey,
      currency: 'COP',
      amountInCents,
      reference,
      ...(safeRedirectUrl ? { redirectUrl: safeRedirectUrl } : {}),
      expirationTime,
      signature: { integrity },
      customerData: this.buildCustomerData(sale),
      shippingAddress: this.buildShippingAddress(sale),
    };
  }

  async syncTransactionWithSale(user: any, saleId: number, transactionId: string) {
    const sale = await this.salesService.findOne(saleId);
    this.ensureSaleOwnership(sale, user);

    const transaction = await this.fetchTransaction(transactionId);
    const updatedSale = await this.applyTransactionToSale(transaction, saleId);

    return {
      saleId,
      saleCode: updatedSale?.salecode ?? sale?.salecode ?? null,
      reference: String(transaction?.reference ?? ''),
      transactionId: String(transaction?.id ?? transactionId),
      transactionStatus: String(transaction?.status ?? 'UNKNOWN'),
      transactionStatusMessage: String(transaction?.status_message ?? ''),
      paymentMethod: this.mapPaymentMethod(transaction),
      amountInCents: Number(transaction?.amount_in_cents ?? 0),
      currency: String(transaction?.currency ?? 'COP'),
      paymentState: updatedSale?.estadoPago ?? sale?.estadoPago ?? null,
      saleStatus: updatedSale?.salestatus ?? sale?.salestatus ?? null,
    };
  }

  async syncTransactionForCheckout(
    saleId: number,
    transactionId: string,
    reference: string,
  ) {
    const referenceSaleId = this.extractSaleId(reference);
    if (!referenceSaleId || Number(referenceSaleId) !== Number(saleId)) {
      throw new BadRequestException(
        'La referencia del checkout no corresponde a la venta solicitada.',
      );
    }

    const transaction = await this.fetchTransaction(transactionId);
    const transactionReference = String(transaction?.reference ?? '').trim();
    const transactionSaleId = this.extractSaleId(transactionReference);

    if (!transactionSaleId || Number(transactionSaleId) !== Number(saleId)) {
      throw new BadRequestException(
        'La transaccion consultada no corresponde a la venta solicitada.',
      );
    }

    const updatedSale = await this.applyTransactionToSale(transaction, saleId);

    return {
      saleId,
      saleCode: updatedSale?.salecode ?? null,
      reference: transactionReference,
      transactionId: String(transaction?.id ?? transactionId),
      transactionStatus: String(transaction?.status ?? 'UNKNOWN'),
      transactionStatusMessage: String(transaction?.status_message ?? ''),
      paymentMethod: this.mapPaymentMethod(transaction),
      amountInCents: Number(transaction?.amount_in_cents ?? 0),
      currency: String(transaction?.currency ?? 'COP'),
      paymentState: updatedSale?.estadoPago ?? null,
      saleStatus: updatedSale?.salestatus ?? null,
    };
  }

  async handleWompiEvent(payload: WompiEventPayload, checksumHeader?: string) {
    if (payload?.event !== 'transaction.updated') {
      return { ok: true, ignored: true };
    }

    if (!this.isValidEventSignature(payload, checksumHeader)) {
      this.logger.warn('Evento Wompi ignorado por checksum invalido.');
      return { ok: true, ignored: true, reason: 'invalid-checksum' };
    }

    const transaction = payload?.data?.transaction;
    if (!transaction?.id) {
      return { ok: true, ignored: true, reason: 'missing-transaction' };
    }

    const updatedSale = await this.applyTransactionToSale(transaction);

    return {
      ok: true,
      saleId: updatedSale?.saleid ?? null,
      transactionId: String(transaction.id),
      status: String(transaction.status ?? 'UNKNOWN'),
    };
  }

  private getWompiEnv(): 'sandbox' | 'production' {
    return String(this.configService.get<string>('WOMPI_ENV') ?? 'sandbox')
      .trim()
      .toLowerCase() === 'production'
      ? 'production'
      : 'sandbox';
  }

  private getWompiBaseUrl() {
    return this.getWompiEnv() === 'production'
      ? 'https://production.wompi.co/v1'
      : 'https://sandbox.wompi.co/v1';
  }

  private getRequiredConfig(key: string) {
    const value = String(this.configService.get<string>(key) ?? '').trim();
    if (!value) {
      throw new BadRequestException(
        `Falta configurar ${key} para usar pagos con Wompi.`,
      );
    }
    return value;
  }

  private ensureWompiConfigMatchesEnv({
    publicKey,
    integritySecret,
    eventsSecret,
  }: {
    publicKey?: string;
    integritySecret?: string;
    eventsSecret?: string;
  }) {
    const env = this.getWompiEnv();
    const expected = env === 'production' ? 'prod' : 'test';

    if (publicKey && !publicKey.startsWith(`pub_${expected}_`)) {
      throw new BadRequestException(
        `WOMPI_ENV esta en ${env}, pero WOMPI_PUBLIC_KEY no corresponde a ese ambiente.`,
      );
    }

    if (integritySecret && !integritySecret.startsWith(`${expected}_integrity_`)) {
      throw new BadRequestException(
        `WOMPI_ENV esta en ${env}, pero WOMPI_INTEGRITY_SECRET no corresponde a ese ambiente.`,
      );
    }

    if (eventsSecret && !eventsSecret.startsWith(`${expected}_events_`)) {
      throw new BadRequestException(
        `WOMPI_ENV esta en ${env}, pero WOMPI_EVENTS_SECRET no corresponde a ese ambiente.`,
      );
    }
  }

  private ensureSaleOwnership(sale: any, user: any) {
    const authUserId = resolveUserIdFromAuth(user);
    const saleUserId = Number(sale?.customer?.users?.userid ?? 0);
    const roleId = Number(user?.roleid ?? user?.roleId ?? 0);
    const isAdmin = roleId === 1;

    if (!isAdmin && saleUserId !== authUserId) {
      throw new ForbiddenException(
        'No tienes permisos para iniciar el pago de esta venta.',
      );
    }
  }

  private ensureCheckoutAllowed(sale: any) {
    const saleStatus = String(sale?.salestatus ?? '').trim().toLowerCase();
    const paymentState = String(sale?.estadoPago ?? '').trim().toLowerCase();

    if (saleStatus === 'cancelled') {
      throw new BadRequestException('La venta ya fue anulada.');
    }

    if (paymentState === 'pagada') {
      throw new BadRequestException('La venta ya se encuentra pagada.');
    }
  }

  private getSaleAmountInCents(sale: any) {
    const amount = Number(sale?.totalamount ?? 0);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestException('La venta no tiene un total valido para cobrar.');
    }
    return Math.round(amount * 100);
  }

  private buildReference(saleId: number) {
    return `${WOMPI_REFERENCE_PREFIX}-${saleId}-${Date.now()}`;
  }

  private resolveRedirectUrl(
    redirectUrl: string | undefined,
    saleId: number,
    reference: string,
  ) {
    const fromRequest = String(redirectUrl ?? '').trim();
    const configuredRedirect = String(
      this.configService.get<string>('WOMPI_REDIRECT_URL') ?? '',
    ).trim();
    const configuredFrontend = String(
      this.configService.get<string>('FRONTEND_URL') ?? '',
    ).trim();

    const candidates = [
      fromRequest,
      configuredRedirect,
      configuredFrontend
        ? `${configuredFrontend.replace(/\/+$/, '')}/payments/register`
        : '',
    ]
      .map((value) => String(value ?? '').trim())
      .filter(Boolean);

    const base = candidates.find((candidate) => {
      const normalized = this.normalizeUrl(candidate);
      return !this.isLocalUrl(normalized);
    });

    if (!base) return undefined;

    const normalizedBase = this.normalizeUrl(base);
    const url = new URL(normalizedBase);
    url.searchParams.set('saleId', String(saleId));
    url.searchParams.set('reference', reference);
    return url.toString();
  }

  private normalizeUrl(value: string) {
    const trimmed = String(value ?? '').trim();
    if (!trimmed) return trimmed;
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  }

  private isLocalUrl(value: string) {
    try {
      const url = new URL(value);
      const host = String(url.hostname ?? '').trim().toLowerCase();
      return (
        host === 'localhost' ||
        host === '127.0.0.1' ||
        host === '0.0.0.0' ||
        host.endsWith('.local')
      );
    } catch {
      return false;
    }
  }

  private buildCustomerData(sale: any) {
    const user = sale?.customer?.users;
    if (!user) return undefined;

    const phoneNumber = this.normalizePhone(user.phone);
    const fullName = [user?.name, user?.lastname].filter(Boolean).join(' ').trim();

    return {
      email: String(user?.email ?? '').trim() || undefined,
      fullName: fullName || undefined,
      phoneNumber: phoneNumber || undefined,
      phoneNumberPrefix: phoneNumber ? '+57' : undefined,
      legalId: String(user?.documentnumber ?? '').trim() || undefined,
      legalIdType: 'CC',
    };
  }

  private buildShippingAddress(sale: any) {
    const direccion = this.extractDeliveryAddress(sale);
    const city = String(sale?.customer?.customercity ?? '').trim();
    const phoneNumber = this.normalizePhone(sale?.customer?.users?.phone);

    if (!direccion && !city) return undefined;

    return {
      addressLine1: direccion || undefined,
      city: city || undefined,
      phoneNumber: phoneNumber || undefined,
      region: city || undefined,
      country: 'CO',
    };
  }

  private extractDeliveryAddress(sale: any) {
    const directAddress = String(sale?.direccion ?? '').trim();
    if (directAddress) return directAddress;

    const notes = String(sale?.notes ?? '').trim();
    const match = /Direccion de entrega:\s*(.+?)(?:\.\s*Envio:|$)/i.exec(notes);
    return String(match?.[1] ?? '').trim();
  }

  private normalizePhone(value: unknown) {
    const digits = String(value ?? '').replace(/\D/g, '');
    if (!digits) return undefined;
    if (digits.startsWith('57') && digits.length > 10) {
      return digits.slice(2);
    }
    return digits.length > 10 ? digits.slice(-10) : digits;
  }

  private async fetchTransaction(transactionId: string): Promise<WompiTransactionData> {
    const publicKey = this.getRequiredConfig('WOMPI_PUBLIC_KEY');
    this.ensureWompiConfigMatchesEnv({ publicKey });
    const url = `${this.getWompiBaseUrl()}/transactions/${encodeURIComponent(transactionId)}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${publicKey}`,
        'Content-Type': 'application/json',
      },
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      throw new BadRequestException(
        `No se pudo consultar la transaccion en Wompi (${response.status}).`,
      );
    }

    const transaction = payload?.data ?? payload;
    if (!transaction?.id) {
      throw new BadRequestException('Wompi no devolvio una transaccion valida.');
    }

    return transaction as WompiTransactionData;
  }

  private async applyTransactionToSale(
    transaction: WompiTransactionData,
    expectedSaleId?: number,
  ) {
    const reference = String(transaction?.reference ?? '').trim();
    const referenceSaleId = this.extractSaleId(reference);
    if (
      expectedSaleId &&
      referenceSaleId &&
      Number(expectedSaleId) !== Number(referenceSaleId)
    ) {
      throw new BadRequestException(
        'La transaccion consultada no corresponde a la venta solicitada.',
      );
    }
    const saleId = expectedSaleId ?? referenceSaleId;

    if (!saleId) {
      this.logger.warn(
        `No se pudo resolver la venta para la referencia Wompi "${reference}".`,
      );
      return null;
    }

    const sale = await this.salesService.findOne(saleId);
    if (!sale) return null;

    const expectedAmount = this.getSaleAmountInCents(sale);
    const receivedAmount = Number(transaction?.amount_in_cents ?? 0);
    if (receivedAmount > 0 && expectedAmount !== receivedAmount) {
      throw new BadRequestException(
        'La transaccion consultada no coincide con el valor esperado de la venta.',
      );
    }

    const nextNotes = this.mergePaymentNote(sale?.notes, transaction);
    const nextPaymentMethod = this.mapPaymentMethod(transaction);
    const nextStatus = String(transaction?.status ?? '').trim().toUpperCase();

    const nextState =
      nextStatus === WOMPI_TRANSACTION_SUCCESS ? 'Pagada' : sale?.estadoPago ?? null;
    const nextSaleStatus =
      nextStatus === WOMPI_TRANSACTION_SUCCESS ? 'Completed' : sale?.salestatus ?? 'Pending';

    return this.salesService.update(saleId, {
      paymentmethod: nextPaymentMethod,
      estadoPago: nextState as any,
      salestatus: nextSaleStatus,
      notes: nextNotes,
    } as any);
  }

  private extractSaleId(reference: string) {
    const match = /^VERTECX-SALE-(\d+)-\d+$/i.exec(String(reference ?? '').trim());
    const id = Number(match?.[1] ?? 0);
    return Number.isFinite(id) && id > 0 ? id : null;
  }

  private mapPaymentMethod(transaction: WompiTransactionData) {
    const type = String(
      transaction?.payment_method_type ?? '',
    ).trim().toUpperCase();

    switch (type) {
      case 'NEQUI':
        return 'Transfer';
      case 'PSE':
        return 'Transfer';
      case 'BANCOLOMBIA_TRANSFER':
      case 'BANCOLOMBIA_QR':
        return 'Transfer';
      case 'CARD':
        return 'Credit Card';
      default:
        return 'Transfer';
    }
  }

  private mergePaymentNote(currentNotes: string | null | undefined, transaction: WompiTransactionData) {
    const txId = String(transaction?.id ?? '').trim();
    const base = String(currentNotes ?? '').trim();

    if (txId && base.includes(txId)) {
      return base;
    }

    const extra = [
      `Pago Wompi ${txId || 'sin-id'}`,
      `ref ${String(transaction?.reference ?? '').trim() || 'sin-referencia'}`,
      `estado ${String(transaction?.status ?? '').trim() || 'UNKNOWN'}`,
      `metodo ${this.mapPaymentMethod(transaction)}`,
    ].join(' | ');

    return [base, extra].filter(Boolean).join('\n').trim();
  }

  private isValidEventSignature(payload: WompiEventPayload, checksumHeader?: string) {
    const secret = String(
      this.configService.get<string>('WOMPI_EVENTS_SECRET') ?? '',
    ).trim();
    if (!secret) {
      this.logger.warn(
        'WOMPI_EVENTS_SECRET no esta configurado; el webhook no puede validarse.',
      );
      return false;
    }
    this.ensureWompiConfigMatchesEnv({ eventsSecret: secret });

    const expectedEnvironment = this.getWompiEnv() === 'production' ? 'prod' : 'test';
    const payloadEnvironment = String(payload?.environment ?? '').trim().toLowerCase();
    if (payloadEnvironment && payloadEnvironment !== expectedEnvironment) {
      this.logger.warn(
        `Evento Wompi ignorado por ambiente inesperado: ${payloadEnvironment}.`,
      );
      return false;
    }

    const signature = payload?.signature;
    const properties = Array.isArray(signature?.properties)
      ? signature.properties
      : [];
    const timestamp = String(payload?.timestamp ?? '').trim();
    const providedChecksum = String(
      checksumHeader ?? signature?.checksum ?? '',
    )
      .trim()
      .toLowerCase();

    if (!properties.length || !timestamp || !providedChecksum) {
      return false;
    }

    const base = properties
      .map((path) => this.readSignatureValue(payload?.data, path))
      .join('');

    const expected = this.sha256(`${base}${timestamp}${secret}`).toLowerCase();
    return expected === providedChecksum;
  }

  private readSignatureValue(payload: Record<string, any> | undefined, path: string) {
    const parts = String(path ?? '')
      .split('.')
      .map((part) => part.trim())
      .filter(Boolean);

    let current: any = payload;
    for (const part of parts) {
      current = current?.[part];
    }

    if (current === null || current === undefined) return '';
    if (typeof current === 'object') return JSON.stringify(current);
    return String(current);
  }

  private sha256(value: string) {
    return createHash('sha256').update(value).digest('hex');
  }
}
