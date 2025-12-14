import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, EntityManager, In, ILike, Repository } from 'typeorm';

import { OrdersServices } from './entities/orders-services.entity';
import { OrdersServicesProducts } from './entities/orders-services-products.entity';
import { OrdersServicesServices } from './entities/orders-services-services.entity';
import { OrdersServicesHistory, OrdersServicesHistoryType } from './entities/orders-services-history.entity';
import { OrdersServicesWarranty } from './entities/orders-services-warranty.entity';

import { Products } from 'src/products/entities/products.entity';
import { Services } from 'src/services/entities/services.entity';
import { Technicians } from 'src/technicians/entities/technicians.entity';
import { Customers } from 'src/customers/entities/customers.entity';
import { States } from 'src/shared/entities/states.entity';
import { Users } from 'src/users/entities/users.entity';

import { CreateOrdersServicesDto } from './dto/create-orders-services.dto';
import { UpdateOrdersServicesDto } from './dto/update-orders-services.dto';
import { AddProductDto } from './dto/add-product.dto';
import { AddServiceDto } from './dto/add-service.dto';
import { AssignTechniciansDto } from './dto/assign-technicians.dto';
import { FinishOrderDto } from './dto/finish-order.dto';
import { AddFileDto } from './dto/add-file.dto';
import { RemoveFileDto } from './dto/remove-file.dto';
import { ReprogramOrderDto } from './dto/reprogram-order.dto';
import { AddWorklogDto } from './dto/add-worklog.dto';
import { ReportWarrantyDto } from './dto/report-warranty.dto';

type ActorUserId = number | null | undefined;

const ORDER_RELATIONS = [
  'products',
  'products.product',
  'services',
  'services.service',
  'services.service.typeofservice',
  'technicians',
  'technicians.users',
  'client',
  'client.users',
  'state',
  'history',
  'history.technician',
  'history.technician.users',
  'warrantyRecord',
  'warrantyRecord.reportedBy',
] as const;

@Injectable()
export class OrdersServicesService {
  constructor(
    @InjectRepository(OrdersServices) private readonly ordersRepo: Repository<OrdersServices>,
    @InjectRepository(OrdersServicesProducts) private readonly ospRepo: Repository<OrdersServicesProducts>,
    @InjectRepository(OrdersServicesServices) private readonly ossRepo: Repository<OrdersServicesServices>,
    @InjectRepository(OrdersServicesHistory) private readonly historyRepo: Repository<OrdersServicesHistory>,
    @InjectRepository(OrdersServicesWarranty) private readonly warrantyRepo: Repository<OrdersServicesWarranty>,
    @InjectRepository(Products) private readonly productsRepo: Repository<Products>,
    @InjectRepository(Services) private readonly servicesRepo: Repository<Services>,
    @InjectRepository(Technicians) private readonly techRepo: Repository<Technicians>,
    @InjectRepository(Customers) private readonly clientsRepo: Repository<Customers>,
    @InjectRepository(States) private readonly statesRepo: Repository<States>,
    @InjectRepository(Users) private readonly usersRepo: Repository<Users>,
  ) {}

  private asMoneyInt(v: any) {
    const n = Number(v);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.round(n));
  }

  private computeTotals(subProducts: number, subServices: number, viaticos: number) {
    const base = this.asMoneyInt(subProducts) + this.asMoneyInt(subServices) + this.asMoneyInt(viaticos);
    const iva = this.asMoneyInt((base * 19) / 100);
    const total = base + iva;
    return { base, iva, total };
  }

  private isAnulada(stateName?: string | null) {
    const n = (stateName ?? '').toLowerCase();
    return n.includes('anul') || n.includes('revoke');
  }

  private async getWarrantyState(kind: 'garantia' | 'garantia reportada') {
    if (kind === 'garantia reportada') {
      const st = await this.statesRepo.findOne({ where: { name: ILike('%garan%report%') } as any });
      if (!st) throw new BadRequestException("No existe el estado 'Garantia reportada' en states.");
      return st;
    }

    const st = await this.statesRepo
      .createQueryBuilder('s')
      .where("LOWER(COALESCE(s.name,'')) LIKE :q", { q: '%garan%' })
      .andWhere("LOWER(COALESCE(s.name,'')) NOT LIKE :r", { r: '%report%' })
      .orderBy('s.stateid', 'ASC')
      .getOne();

    if (!st) throw new BadRequestException("No existe el estado 'Garantia' en states.");
    return st;
  }

  private present(order: OrdersServices) {
    const files = Array.isArray(order.files) ? order.files : [];
    const products = order.products ?? [];
    const services = order.services ?? [];
    const technicians = order.technicians ?? [];
    const history = order.history ?? [];
    const viaticos = (order as any).viaticos ?? 0;
    const total = (order as any).total ?? 0;

    const wr = (order as any).warrantyRecord as OrdersServicesWarranty | undefined;
    const u = wr?.reportedBy ?? null;
    const reportedBy =
      u ? [u.name, u.lastname].filter(Boolean).join(' ').trim() || null : null;

    const warranty = wr
      ? {
          label: wr.label ?? 'Daño dentro de garantía',
          details: wr.details ?? '',
          notifiedClient: !!wr.notifiedclient,
          reportedBy,
          reportedByUserId: u?.userid ?? null,
          reportedAtISO: wr.reportedat ? wr.reportedat.toISOString() : null,
        }
      : null;

    const out: any = {
      ...order,
      files,
      products,
      services,
      technicians,
      history,
      viaticos,
      total,
      warranty,
    };

    delete out.warrantyRecord;
    return out;
  }

  private presentMany(list: OrdersServices[]) {
    return (Array.isArray(list) ? list : []).map((o) => this.present(o));
  }

  private async validateOrder(id: number) {
    const order = await this.ordersRepo.findOne({
      where: { ordersservicesid: id } as any,
      relations: [...ORDER_RELATIONS] as any,
      order: { ordersservicesid: 'ASC', history: { createdat: 'DESC' } } as any,
    });

    if (!order) throw new NotFoundException('Orden no encontrada');

    order.files = Array.isArray(order.files) ? order.files : [];
    order.products = order.products ?? [];
    order.services = order.services ?? [];
    order.technicians = order.technicians ?? [];
    order.history = order.history ?? [];
    order.viaticos = order.viaticos ?? 0;
    order.total = order.total ?? 0;

    return order;
  }

  private async logSystem(historyRepo: Repository<OrdersServicesHistory>, orderId: number, message: string, actoruserid: ActorUserId) {
    await historyRepo.save(
      historyRepo.create({
        order: { ordersservicesid: orderId } as any,
        type: 'SYSTEM',
        message,
        technician: null,
        actoruserid: actoruserid ?? null,
        progresspercent: null,
        attachments: null,
      }),
    );
  }

  private async recalcAndPersistTotal(em: EntityManager, orderId: number) {
    const ordersRepo = em.getRepository(OrdersServices);
    const ospRepo = em.getRepository(OrdersServicesProducts);
    const ossRepo = em.getRepository(OrdersServicesServices);

    const order = await ordersRepo.findOne({ where: { ordersservicesid: orderId } as any });
    if (!order) throw new NotFoundException('Orden no encontrada');

    const prod = await ospRepo
      .createQueryBuilder('osp')
      .select('COALESCE(SUM(osp.subtotal),0)', 'sum')
      .where('osp.ordersservicesid = :orderId', { orderId })
      .getRawOne<{ sum: string }>();

    const serv = await ossRepo
      .createQueryBuilder('oss')
      .select('COALESCE(SUM(oss.subtotal),0)', 'sum')
      .where('oss.ordersservicesid = :orderId', { orderId })
      .getRawOne<{ sum: string }>();

    const subProducts = this.asMoneyInt(prod?.sum ?? 0);
    const subServices = this.asMoneyInt(serv?.sum ?? 0);
    const viaticos = this.asMoneyInt((order as any).viaticos ?? 0);

    const { total } = this.computeTotals(subProducts, subServices, viaticos);
    await ordersRepo.update({ ordersservicesid: orderId } as any, { total } as any);
    return total;
  }

  private async createCore(em: EntityManager, dto: CreateOrdersServicesDto, actoruserid?: ActorUserId): Promise<number> {
    const ordersRepo = em.getRepository(OrdersServices);
    const ospRepo = em.getRepository(OrdersServicesProducts);
    const ossRepo = em.getRepository(OrdersServicesServices);
    const historyRepo = em.getRepository(OrdersServicesHistory);
    const productsRepo = em.getRepository(Products);
    const servicesRepo = em.getRepository(Services);
    const techRepo = em.getRepository(Technicians);
    const clientsRepo = em.getRepository(Customers);
    const statesRepo = em.getRepository(States);

    const client = await clientsRepo.findOne({ where: { customerid: dto.clientid } as any });
    if (!client) throw new BadRequestException('Cliente no existe');

    const state = await statesRepo.findOne({ where: { stateid: dto.stateid } as any });
    if (!state) throw new BadRequestException('Estado no existe');

    const techIds = dto.technicians ?? [];
    if (techIds.length === 0) throw new BadRequestException('Debe asignar al menos un técnico');

    const technicians = await techRepo.find({ where: { technicianid: In(techIds) } as any });
    if (technicians.length !== techIds.length) throw new BadRequestException('Uno o más técnicos no existen');

    const items = dto.products ?? [];
    if (items.length === 0) throw new BadRequestException('Debe agregar al menos un producto');

    const viaticos = this.asMoneyInt(dto.viaticos ?? 0);

    const order = ordersRepo.create({
      description: dto.description,
      total: 0,
      viaticos,
      files: dto.files ?? [],
      client,
      state,
      fechainicio: dto.fechainicio as any,
      fechafin: dto.fechafin as any,
      horainicio: dto.horainicio,
      horafin: dto.horafin,
      technicians,
    });

    await ordersRepo.save(order);

    const seenProducts = new Set<number>();
    let subProducts = 0;

    for (const item of items) {
      if (seenProducts.has(item.productid)) throw new BadRequestException('Hay productos repetidos en la orden');
      seenProducts.add(item.productid);

      const product = await productsRepo.findOne({ where: { productid: item.productid } as any });
      if (!product) throw new BadRequestException('Producto no existe');

      const unit = Number(product.productpriceofsale ?? 0);
      if (!Number.isFinite(unit) || unit < 0) throw new BadRequestException('Precio de producto inválido');

      const subtotal = this.asMoneyInt(unit * item.cantidad);
      subProducts += subtotal;

      await ospRepo.save(
        ospRepo.create({
          order: { ordersservicesid: order.ordersservicesid } as any,
          product,
          cantidad: item.cantidad,
          subtotal,
        }),
      );
    }

    const serviceItems = dto.services ?? [];
    const seenServices = new Set<number>();
    let subServices = 0;

    for (const item of serviceItems) {
      if (seenServices.has(item.serviceid)) throw new BadRequestException('Hay servicios repetidos en la orden');
      seenServices.add(item.serviceid);

      const service = await servicesRepo.findOne({ where: { serviceid: item.serviceid } as any });
      if (!service) throw new BadRequestException('Servicio no existe');

      const unitprice = this.asMoneyInt((item as any).unitprice ?? (item as any).precio);
      if (unitprice === 0 && ((item as any).unitprice === undefined && (item as any).precio === undefined)) {
        throw new BadRequestException('unitprice (o precio) es obligatorio para cada servicio');
      }

      const subtotal = this.asMoneyInt(unitprice * item.cantidad);
      subServices += subtotal;

      await ossRepo.save(
        ossRepo.create({
          order: { ordersservicesid: order.ordersservicesid } as any,
          service,
          cantidad: item.cantidad,
          unitprice,
          subtotal,
        }),
      );
    }

    const { total } = this.computeTotals(subProducts, subServices, viaticos);
    await ordersRepo.update({ ordersservicesid: order.ordersservicesid } as any, { total } as any);

    await this.logSystem(historyRepo, order.ordersservicesid, 'Orden creada', actoruserid);

    return order.ordersservicesid;
  }

  async create(dto: CreateOrdersServicesDto, actoruserid?: ActorUserId) {
    const id = await this.ordersRepo.manager.transaction((em) => this.createCore(em, dto, actoruserid));
    const order = await this.validateOrder(id);
    return this.present(order);
  }

  async findAll() {
    const list = await this.ordersRepo.find({
      relations: [...ORDER_RELATIONS] as any,
      order: { ordersservicesid: 'ASC', history: { createdat: 'DESC' } } as any,
    });
    return this.presentMany(list);
  }

  async findOne(id: number) {
    const order = await this.validateOrder(id);
    return this.present(order);
  }

  async history(orderId: number, type?: OrdersServicesHistoryType) {
    await this.validateOrder(orderId);
    const where: any = { order: { ordersservicesid: orderId } };
    if (type) where.type = type;

    return this.historyRepo.find({
      where,
      relations: ['technician', 'technician.users'] as any,
      order: { createdat: 'DESC' } as any,
    });
  }

  async addWorklog(orderId: number, dto: AddWorklogDto, actoruserid?: ActorUserId) {
    const order = await this.ordersRepo.findOne({
      where: { ordersservicesid: orderId } as any,
      relations: ['technicians'] as any,
    });
    if (!order) throw new NotFoundException('Orden no encontrada');

    const technician = await this.techRepo.findOne({
      where: { technicianid: dto.technicianid } as any,
      relations: ['users'] as any,
    });
    if (!technician) throw new BadRequestException('Técnico no existe');

    const assigned = (order.technicians ?? []).some((t: any) => t.technicianid === technician.technicianid);
    if (!assigned) throw new BadRequestException('El técnico no está asignado a esta orden');

    const title = (dto.title ?? '').trim() || 'Avance';
    const note = (dto.note ?? '').trim();
    if (!note) throw new BadRequestException('note es obligatorio');

    const created = await this.historyRepo.save(
      this.historyRepo.create({
        order: { ordersservicesid: orderId } as any,
        type: 'TECH',
        message: `${title}\n${note}`.trim(),
        technician,
        actoruserid: actoruserid ?? null,
        progresspercent: (dto as any).progresspercent ?? null,
        attachments: (dto as any).attachments ?? null,
      }),
    );

    return this.historyRepo.findOne({
      where: { ordersserviceshistoryid: created.ordersserviceshistoryid } as any,
      relations: ['technician', 'technician.users'] as any,
    });
  }

  async update(id: number, dto: UpdateOrdersServicesDto, actoruserid?: ActorUserId) {
    const order = await this.validateOrder(id);

    let mustRecalc = false;

    if (dto.description !== undefined) order.description = dto.description;

    if (dto.clientid !== undefined) {
      const client = await this.clientsRepo.findOne({ where: { customerid: dto.clientid } as any });
      if (!client) throw new BadRequestException('Cliente no existe');
      order.client = client;
    }

    if (dto.stateid !== undefined) {
      const state = await this.statesRepo.findOne({ where: { stateid: dto.stateid } as any });
      if (!state) throw new BadRequestException('Estado no existe');
      order.state = state;
    }

    if (dto.fechainicio !== undefined) order.fechainicio = dto.fechainicio as any;
    if (dto.fechafin !== undefined) order.fechafin = dto.fechafin as any;
    if (dto.horainicio !== undefined) order.horainicio = dto.horainicio;
    if (dto.horafin !== undefined) order.horafin = dto.horafin;

    if (dto.files !== undefined) order.files = dto.files ?? [];

    if (dto.viaticos !== undefined) {
      order.viaticos = this.asMoneyInt(dto.viaticos);
      mustRecalc = true;
    }

    if (dto.technicians !== undefined) {
      const techIds = dto.technicians ?? [];
      if (techIds.length === 0) throw new BadRequestException('Debe asignar al menos un técnico');
      const technicians = await this.techRepo.find({ where: { technicianid: In(techIds) } as any });
      if (technicians.length !== techIds.length) throw new BadRequestException('Uno o más técnicos no existen');
      order.technicians = technicians;
    }

    await this.ordersRepo.save(order);

    if (mustRecalc) {
      await this.ordersRepo.manager.transaction((em) => this.recalcAndPersistTotal(em, id));
    }

    await this.logSystem(this.historyRepo, id, 'Orden actualizada', actoruserid);

    const updated = await this.validateOrder(id);
    return this.present(updated);
  }

  async remove(id: number) {
    const order = await this.validateOrder(id);
    await this.ordersRepo.remove(order);
    return { deleted: true, id };
  }

  async markWarranty(orderId: number, actoruserid?: ActorUserId) {
    await this.ordersRepo.manager.transaction(async (em) => {
      const ordersRepo = em.getRepository(OrdersServices);
      const warrantyRepo = em.getRepository(OrdersServicesWarranty);
      const historyRepo = em.getRepository(OrdersServicesHistory);

      const order = await ordersRepo.findOne({
        where: { ordersservicesid: orderId } as any,
        relations: ['state', 'client', 'client.users'] as any,
      });
      if (!order) throw new NotFoundException('Orden no encontrada');

      if (this.isAnulada(order.state?.name)) throw new BadRequestException('No se puede marcar garantía en una orden anulada.');

      const warrantyState = await this.getWarrantyState('garantia');

      let wr = await warrantyRepo.findOne({
        where: { order: { ordersservicesid: orderId } as any } as any,
        relations: ['reportedBy'] as any,
      });

      if (!wr) {
        wr = warrantyRepo.create({
          order: { ordersservicesid: orderId } as any,
          label: 'Daño dentro de garantía',
          details: null,
          notifiedclient: false,
          reportedBy: null,
          reportedat: null,
        });
      } else {
        wr.label = wr.label ?? 'Daño dentro de garantía';
      }

      await warrantyRepo.save(wr);

      order.state = warrantyState;
      await ordersRepo.save(order);

      await this.logSystem(historyRepo, orderId, 'Garantía marcada', actoruserid);
    });

    const updated = await this.validateOrder(orderId);
    return this.present(updated);
  }

  async reportWarranty(orderId: number, dto: ReportWarrantyDto, actoruserid?: ActorUserId) {
    const details = (dto.details ?? '').trim();
    if (!details) throw new BadRequestException('details es obligatorio');

    await this.ordersRepo.manager.transaction(async (em) => {
      const ordersRepo = em.getRepository(OrdersServices);
      const warrantyRepo = em.getRepository(OrdersServicesWarranty);
      const usersRepo = em.getRepository(Users);
      const historyRepo = em.getRepository(OrdersServicesHistory);

      const order = await ordersRepo.findOne({
        where: { ordersservicesid: orderId } as any,
        relations: ['state', 'client', 'client.users'] as any,
      });
      if (!order) throw new NotFoundException('Orden no encontrada');

      if (this.isAnulada(order.state?.name)) throw new BadRequestException('No se puede reportar garantía en una orden anulada.');

      const reportedState = await this.getWarrantyState('garantia reportada');

      let reporterUserId = dto.reportedByUserId ?? (actoruserid ? Number(actoruserid) : undefined);

      if (!reporterUserId) {
        reporterUserId = (order as any)?.client?.users?.userid ? Number((order as any).client.users.userid) : undefined;
      }

      let reporter: Users | null = null;
      if (reporterUserId) {
        reporter = await usersRepo.findOne({ where: { userid: reporterUserId } as any });
        if (!reporter) throw new BadRequestException('reportedByUserId no existe');
      }

      let wr = await warrantyRepo.findOne({
        where: { order: { ordersservicesid: orderId } as any } as any,
        relations: ['reportedBy'] as any,
      });

      if (!wr) {
        wr = warrantyRepo.create({
          order: { ordersservicesid: orderId } as any,
          label: null,
          details: null,
          notifiedclient: false,
          reportedBy: null,
          reportedat: null,
        });
      }

      const label = (dto.label ?? wr.label ?? 'Daño dentro de garantía').trim() || 'Daño dentro de garantía';

      wr.label = label;
      wr.details = details;
      wr.notifiedclient = dto.notifiedClient ?? wr.notifiedclient ?? false;
      wr.reportedBy = reporter;
      wr.reportedat = wr.reportedat ?? new Date();

      await warrantyRepo.save(wr);

      order.state = reportedState;
      await ordersRepo.save(order);

      await this.logSystem(historyRepo, orderId, `Garantía reportada: ${label}`, actoruserid);
    });

    const updated = await this.validateOrder(orderId);
    return this.present(updated);
  }

  async addProduct(id: number, dto: AddProductDto) {
    await this.ordersRepo.manager.transaction(async (em) => {
      const ordersRepo = em.getRepository(OrdersServices);
      const ospRepo = em.getRepository(OrdersServicesProducts);
      const productsRepo = em.getRepository(Products);

      const order = await ordersRepo.findOne({ where: { ordersservicesid: id } as any });
      if (!order) throw new NotFoundException('Orden no encontrada');

      const exists = await ospRepo.findOne({
        where: {
          order: { ordersservicesid: id } as any,
          product: { productid: dto.productid } as any,
        } as any,
      });
      if (exists) throw new BadRequestException('Ese producto ya está agregado');

      const product = await productsRepo.findOne({ where: { productid: dto.productid } as any });
      if (!product) throw new BadRequestException('Producto no existe');

      const unit = Number(product.productpriceofsale ?? 0);
      if (!Number.isFinite(unit) || unit < 0) throw new BadRequestException('Precio de producto inválido');

      const subtotal = this.asMoneyInt(unit * dto.cantidad);

      await ospRepo.save(
        ospRepo.create({
          order: { ordersservicesid: id } as any,
          product,
          cantidad: dto.cantidad,
          subtotal,
        }),
      );

      await this.recalcAndPersistTotal(em, id);
    });

    const order = await this.validateOrder(id);
    return this.present(order);
  }

  async removeProduct(id: number, productId: number) {
    await this.ordersRepo.manager.transaction(async (em) => {
      const ordersRepo = em.getRepository(OrdersServices);
      const ospRepo = em.getRepository(OrdersServicesProducts);

      const order = await ordersRepo.findOne({ where: { ordersservicesid: id } as any });
      if (!order) throw new NotFoundException('Orden no encontrada');

      const row = await ospRepo.findOne({
        where: {
          order: { ordersservicesid: id } as any,
          product: { productid: productId } as any,
        } as any,
        relations: ['product'] as any,
      });
      if (!row) throw new NotFoundException('Producto no está en la orden');

      await ospRepo.remove(row);
      await this.recalcAndPersistTotal(em, id);
    });

    const order = await this.validateOrder(id);
    return this.present(order);
  }

  async addService(id: number, dto: AddServiceDto) {
    await this.ordersRepo.manager.transaction(async (em) => {
      const ordersRepo = em.getRepository(OrdersServices);
      const ossRepo = em.getRepository(OrdersServicesServices);
      const servicesRepo = em.getRepository(Services);

      const order = await ordersRepo.findOne({ where: { ordersservicesid: id } as any });
      if (!order) throw new NotFoundException('Orden no encontrada');

      const exists = await ossRepo.findOne({
        where: {
          order: { ordersservicesid: id } as any,
          service: { serviceid: dto.serviceid } as any,
        } as any,
      });
      if (exists) throw new BadRequestException('Ese servicio ya está agregado');

      const service = await servicesRepo.findOne({ where: { serviceid: dto.serviceid } as any });
      if (!service) throw new BadRequestException('Servicio no existe');

      const unitprice = this.asMoneyInt((dto as any).unitprice ?? (dto as any).precio);
      if (unitprice === 0 && ((dto as any).unitprice === undefined && (dto as any).precio === undefined)) {
        throw new BadRequestException('unitprice (o precio) es obligatorio');
      }

      const subtotal = this.asMoneyInt(unitprice * dto.cantidad);

      await ossRepo.save(
        ossRepo.create({
          order: { ordersservicesid: id } as any,
          service,
          cantidad: dto.cantidad,
          unitprice,
          subtotal,
        }),
      );

      await this.recalcAndPersistTotal(em, id);
    });

    const order = await this.validateOrder(id);
    return this.present(order);
  }

  async removeService(id: number, serviceId: number) {
    await this.ordersRepo.manager.transaction(async (em) => {
      const ordersRepo = em.getRepository(OrdersServices);
      const ossRepo = em.getRepository(OrdersServicesServices);

      const order = await ordersRepo.findOne({ where: { ordersservicesid: id } as any });
      if (!order) throw new NotFoundException('Orden no encontrada');

      const row = await ossRepo.findOne({
        where: {
          order: { ordersservicesid: id } as any,
          service: { serviceid: serviceId } as any,
        } as any,
        relations: ['service'] as any,
      });
      if (!row) throw new NotFoundException('Servicio no está en la orden');

      await ossRepo.remove(row);
      await this.recalcAndPersistTotal(em, id);
    });

    const order = await this.validateOrder(id);
    return this.present(order);
  }

  async assignTechnicians(id: number, dto: AssignTechniciansDto) {
    const order = await this.validateOrder(id);

    const techIds = dto.technicians ?? [];
    if (techIds.length === 0) throw new BadRequestException('Debe asignar al menos un técnico');

    const technicians = await this.techRepo.find({ where: { technicianid: In(techIds) } as any });
    if (technicians.length !== techIds.length) throw new BadRequestException('Uno o más técnicos no existen');

    order.technicians = technicians;
    await this.ordersRepo.save(order);

    const updated = await this.validateOrder(id);
    return this.present(updated);
  }

  async finishOrder(id: number, dto: FinishOrderDto) {
    const order = await this.validateOrder(id);

    if ((order.products ?? []).length === 0) throw new BadRequestException('No puede finalizar sin productos');
    if (!order.technicians || order.technicians.length === 0) throw new BadRequestException('No puede finalizar sin técnicos');

    order.horafin = dto.horafin;
    order.fechafin = dto.fechafin as any;

    const finishedState = await this.statesRepo.findOne({ where: { name: 'Finished' } as any });
    if (finishedState) order.state = finishedState;

    await this.ordersRepo.save(order);

    const updated = await this.validateOrder(id);
    return this.present(updated);
  }

  async reprogram(id: number, dto: ReprogramOrderDto) {
    const order = await this.validateOrder(id);

    order.fechainicio = dto.fechainicio as any;
    order.fechafin = dto.fechafin as any;
    order.horainicio = dto.horainicio;
    order.horafin = dto.horafin;

    await this.ordersRepo.save(order);

    const updated = await this.validateOrder(id);
    return this.present(updated);
  }

  async getFiles(orderId: number) {
    const order = await this.validateOrder(orderId);
    return { files: order.files ?? [] };
  }

  async getFileByIndex(orderId: number, index: number) {
    const order = await this.validateOrder(orderId);
    const files = order.files ?? [];
    if (index < 0 || index >= files.length) throw new NotFoundException('Archivo no encontrado');
    return { url: files[index] };
  }

  async addFile(orderId: number, dto: AddFileDto) {
    const order = await this.validateOrder(orderId);
    const files = order.files ?? [];
    const url = dto.url?.trim();

    if (!url) throw new BadRequestException('url es obligatorio');
    if (files.includes(url)) throw new BadRequestException('Ese link ya está agregado');

    order.files = [...files, url];
    await this.ordersRepo.save(order);

    const updated = await this.validateOrder(orderId);
    return this.present(updated);
  }

  async removeFileByIndex(orderId: number, index: number) {
    const order = await this.validateOrder(orderId);
    const files = order.files ?? [];
    if (index < 0 || index >= files.length) throw new NotFoundException('Archivo no encontrado');

    order.files = files.filter((_, i) => i !== index);
    await this.ordersRepo.save(order);

    const updated = await this.validateOrder(orderId);
    return this.present(updated);
  }

  async removeFile(orderId: number, dto: RemoveFileDto) {
    const order = await this.validateOrder(orderId);
    const files = order.files ?? [];
    const url = dto.url?.trim();

    if (!url) throw new BadRequestException('url es obligatorio');
    if (!files.includes(url)) throw new NotFoundException('Archivo no encontrado');

    order.files = files.filter((f) => f !== url);
    await this.ordersRepo.save(order);

    const updated = await this.validateOrder(orderId);
    return this.present(updated);
  }

  async findByTechnician(technicianId: number) {
    const list = await this.ordersRepo
      .createQueryBuilder('o')
      .leftJoinAndSelect('o.products', 'osp')
      .leftJoinAndSelect('osp.product', 'p')
      .leftJoinAndSelect('o.services', 'oss')
      .leftJoinAndSelect('oss.service', 's')
      .leftJoinAndSelect('s.typeofservice', 'tos')
      .leftJoinAndSelect('o.technicians', 't')
      .leftJoinAndSelect('t.users', 'tu')
      .leftJoinAndSelect('o.client', 'c')
      .leftJoinAndSelect('c.users', 'cu')
      .leftJoinAndSelect('o.state', 'st')
      .leftJoinAndSelect('o.history', 'h')
      .leftJoinAndSelect('h.technician', 'ht')
      .leftJoinAndSelect('ht.users', 'htu')
      .leftJoinAndSelect('o.warrantyRecord', 'wr')
      .leftJoinAndSelect('wr.reportedBy', 'wru')
      .where('t.technicianid = :technicianId', { technicianId })
      .orderBy('o.ordersservicesid', 'ASC')
      .addOrderBy('h.createdat', 'DESC')
      .getMany();

    return this.presentMany(list);
  }

  async findByClient(clientId: number) {
    const list = await this.ordersRepo.find({
      where: { client: { customerid: clientId } as any } as any,
      relations: [...ORDER_RELATIONS] as any,
      order: { ordersservicesid: 'ASC', history: { createdat: 'DESC' } } as any,
    });

    return this.presentMany(list);
  }

  async findByState(stateId: number) {
    const list = await this.ordersRepo.find({
      where: { state: { stateid: stateId } as any } as any,
      relations: [...ORDER_RELATIONS] as any,
      order: { ordersservicesid: 'ASC', history: { createdat: 'DESC' } } as any,
    });

    return this.presentMany(list);
  }

  async findByDateRange(from: string, to: string) {
    const list = await this.ordersRepo.find({
      where: { fechainicio: Between(from as any, to as any) } as any,
      relations: [...ORDER_RELATIONS] as any,
      order: { ordersservicesid: 'ASC', history: { createdat: 'DESC' } } as any,
    });

    return this.presentMany(list);
  }
}
