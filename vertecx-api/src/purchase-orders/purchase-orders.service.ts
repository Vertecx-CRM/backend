import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PurchaseOrder } from '../shared/entities/purchase-order.entity';
import { Products } from '../products/entities/products.entity';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { SendNotificationDto } from './dto/send-notification.dto';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class PurchaseOrdersService {
  constructor(
    @InjectRepository(PurchaseOrder)
    private readonly purchaseOrderRepo: Repository<PurchaseOrder>,
    @InjectRepository(Products)
    private readonly productsRepo: Repository<Products>,
    private readonly mailService: MailService,
  ) { }

  private readonly logger = new Logger(PurchaseOrdersService.name);

  // ─── Generar número de orden único ─────────────────────────────────────────
  private generateOrderNumber(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    return `OC-${timestamp}-${random}`;
  }

  // CREATE
  async create(dto: CreatePurchaseOrderDto): Promise<PurchaseOrder> {
    // Si el frontend no envía numeroOrden, generarlo automáticamente
    const numeroorden = dto.numeroOrden || this.generateOrderNumber();

    const existing = await this.purchaseOrderRepo.findOne({
      where: { numeroorden },
    });

    if (existing) {
      throw new ConflictException(
        `El número de orden ${numeroorden} ya existe`,
      );
    }

    const subtotal = dto.precioUnitario * dto.cantidad;
    const iva = subtotal * 0.19;
    const total = subtotal + iva;

    const purchaseOrder = this.purchaseOrderRepo.create({
      numeroorden,
      proveedorid: dto.proveedorId,
      estadoid: dto.estadoId ?? 1, // 1 = Pendiente por defecto
      fecha: dto.fecha,
      preciounitario: dto.precioUnitario,
      cantidad: dto.cantidad,
      subtotal,
      iva,
      total,
      descripcion: dto.descripcion ?? null,
    });

    return await this.purchaseOrderRepo.save(purchaseOrder);
  }

  // FIND ALL
  async findAll(): Promise<PurchaseOrder[]> {
    try {
      return await this.purchaseOrderRepo.find({
        relations: ['state', 'supplier'],
        order: { createat: 'DESC' },
      });
    } catch (error) {
      this.logger.error(`Error al listar órdenes de compra: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error al listar las órdenes de compra');
    }
  }

  // FIND ONE
  async findOne(id: number): Promise<PurchaseOrder> {
    const purchaseOrder = await this.purchaseOrderRepo.findOne({
      where: { id },
      relations: ['state', 'supplier'],
    });

    if (!purchaseOrder) {
      throw new NotFoundException(
        `Orden de compra con ID ${id} no encontrada`,
      );
    }

    return purchaseOrder;
  }

  // FIND BY NUMERO ORDEN
  async findByNumeroOrden(numeroorden: string): Promise<PurchaseOrder> {
    const purchaseOrder = await this.purchaseOrderRepo.findOne({
      where: { numeroorden },
      relations: ['state', 'supplier'],
    });

    if (!purchaseOrder) {
      throw new NotFoundException(
        `Orden de compra ${numeroorden} no encontrada`,
      );
    }

    return purchaseOrder;
  }

  // UPDATE
  async update(
    id: number,
    dto: UpdatePurchaseOrderDto,
  ): Promise<PurchaseOrder> {
    const purchaseOrder = await this.findOne(id);

    if (
      dto.numeroOrden &&
      dto.numeroOrden !== purchaseOrder.numeroorden
    ) {
      const existing = await this.purchaseOrderRepo.findOne({
        where: { numeroorden: dto.numeroOrden },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException(
          `El número de orden ${dto.numeroOrden} ya existe`,
        );
      }

      purchaseOrder.numeroorden = dto.numeroOrden;
    }

    if (dto.fecha) purchaseOrder.fecha = dto.fecha;
    if (dto.precioUnitario !== undefined)
      purchaseOrder.preciounitario = dto.precioUnitario;
    if (dto.cantidad !== undefined)
      purchaseOrder.cantidad = dto.cantidad;
    if (dto.descripcion !== undefined)
      purchaseOrder.descripcion = dto.descripcion;
    if (dto.estadoId !== undefined)
      purchaseOrder.estadoid = dto.estadoId;
    if (dto.proveedorId !== undefined)
      purchaseOrder.proveedorid = dto.proveedorId;

    if (
      dto.precioUnitario !== undefined ||
      dto.cantidad !== undefined
    ) {
      const subtotal =
        purchaseOrder.preciounitario * purchaseOrder.cantidad;
      const iva = subtotal * 0.19;
      const total = subtotal + iva;

      purchaseOrder.subtotal = subtotal;
      purchaseOrder.iva = iva;
      purchaseOrder.total = total;
    }

    return await this.purchaseOrderRepo.save(purchaseOrder);
  }

  // CANCEL (ANULACIÓN LÓGICA)
  async cancel(
    id: number,
    motivo: string,
  ): Promise<PurchaseOrder> {
    const purchaseOrder = await this.findOne(id);

    purchaseOrder.estadoid = 3; // 3 = Anulada
    purchaseOrder.descripcion = motivo;

    return await this.purchaseOrderRepo.save(purchaseOrder);
  }

  // DELETE
  async remove(id: number): Promise<{ message: string }> {
    const purchaseOrder = await this.findOne(id);
    await this.purchaseOrderRepo.remove(purchaseOrder);

    return {
      message: `Orden de compra ${id} eliminada correctamente`,
    };
  }

  // FIND BY SUPPLIER
  async findBySupplier(
    proveedorid: number,
  ): Promise<PurchaseOrder[]> {
    return await this.purchaseOrderRepo.find({
      where: { proveedorid },
      relations: ['state', 'supplier'],
      order: { fecha: 'DESC' },
    });
  }

  // FIND BY STATE
  async findByState(
    estadoid: number,
  ): Promise<PurchaseOrder[]> {
    return await this.purchaseOrderRepo.find({
      where: { estadoid },
      relations: ['state', 'supplier'],
      order: { fecha: 'DESC' },
    });
  }

  // ─── GET PRODUCTS BY SUPPLIER ───────────────────────────────────────────────
  async getProductsBySupplier(
    supplierId: number,
  ): Promise<Products[]> {
    if (!supplierId || supplierId <= 0) {
      throw new BadRequestException('ID de proveedor inválido');
    }
    return await this.productsRepo.find({
      where: { isactive: true },
      order: { productname: 'ASC' },
    });
  }

  // ─── SEND NOTIFICATION ─────────────────────────────────────────────────────
  async sendNotification(dto: SendNotificationDto): Promise<{
    success: boolean;
    channel: 'whatsapp' | 'email' | 'both';
    emailSent: boolean;
    payload: object;
  }> {
    if (!dto.supplierEmail && !dto.supplierPhone) {
      throw new BadRequestException(
        'El proveedor no tiene WhatsApp ni correo registrado. Debe agregar esta información antes de enviar.',
      );
    }

    const channel: 'whatsapp' | 'email' | 'both' =
      dto.supplierEmail && dto.supplierPhone
        ? 'both'
        : dto.supplierEmail
          ? 'email'
          : 'whatsapp';

    const subject = `Orden de Compra ${dto.numeroOrden} — ${dto.supplierName}`;

    const messageBody = `
Orden de Compra: ${dto.numeroOrden}
Proveedor: ${dto.supplierName}
Fecha: ${dto.fecha ?? 'Por definir'}

Productos:
${dto.productos
        .map(
          (p, i) =>
            `  ${i + 1}. ${p.producto} — Cant: ${p.cantidad} × $${p.precioUnitario.toLocaleString('es-CO')} = $${(p.cantidad * p.precioUnitario).toLocaleString('es-CO')}`,
        )
        .join('\n')}

Total: $${dto.total.toLocaleString('es-CO')}
${dto.descripcion ? `\nObservaciones: ${dto.descripcion}` : ''}
    `.trim();

    // ── Envío real de correo ─────────────────────────────────────────────────
    let emailSent = false;
    if (dto.supplierEmail) {
      const html = this.mailService.buildOrderEmailHtml({
        numeroOrden: dto.numeroOrden,
        supplierName: dto.supplierName,
        fecha: dto.fecha,
        productos: dto.productos,
        total: dto.total,
        descripcion: dto.descripcion,
      });

      await this.mailService.sendMail({
        to: dto.supplierEmail,
        subject,
        html,
        text: messageBody,
      });
      emailSent = true;
    }

    const notificationPayload = {
      to: {
        email: dto.supplierEmail ?? null,
        phone: dto.supplierPhone ?? null,
      },
      subject,
      body: messageBody,
      order: {
        numeroOrden: dto.numeroOrden,
        proveedorId: dto.proveedorId,
        supplierName: dto.supplierName,
        fecha: dto.fecha,
        productos: dto.productos,
        total: dto.total,
        descripcion: dto.descripcion,
      },
      sentAt: new Date().toISOString(),
    };

    return {
      success: true,
      channel,
      emailSent,
      payload: notificationPayload,
    };
  }
}
