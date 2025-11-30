import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, EntityManager, In, Repository } from 'typeorm';

import { OrdersServices } from './entities/orders-services.entity';
import { OrdersServicesProducts } from './entities/orders-services-products.entity';
import { OrdersServicesHistory, OrdersServicesHistoryAction } from './entities/orders-services-history.entity';

import { Products } from 'src/products/entities/products.entity';
import { Technicians } from 'src/technicians/entities/technicians.entity';
import { Customers } from 'src/customers/entities/customers.entity';
import { States } from 'src/shared/entities/states.entity';

import { CreateOrdersServicesDto } from './dto/create-orders-services.dto';
import { UpdateOrdersServicesDto } from './dto/update-orders-services.dto';
import { AddProductDto } from './dto/add-product.dto';
import { AssignTechniciansDto } from './dto/assign-technicians.dto';
import { FinishOrderDto } from './dto/finish-order.dto';
import { AddFileDto } from './dto/add-file.dto';
import { RemoveFileDto } from './dto/remove-file.dto';
import { ReprogramOrderDto } from './dto/reprogram-order.dto';

type ActorUserId = number | null | undefined;

const ACTION_LABELS: Record<OrdersServicesHistoryAction, string> = {
  CREATE: 'Orden creada',
  UPDATE: 'Orden actualizada',
  DELETE: 'Orden eliminada',
  ADD_PRODUCT: 'Producto agregado',
  REMOVE_PRODUCT: 'Producto eliminado',
  ASSIGN_TECHNICIANS: 'Técnicos asignados',
  FINISH: 'Orden finalizada',
  ADD_FILE: 'Archivo agregado',
  REMOVE_FILE: 'Archivo eliminado',
  REPROGRAM: 'Orden reprogramada',
};

@Injectable()
export class OrdersServicesService {
  constructor(
    @InjectRepository(OrdersServices) private readonly ordersRepo: Repository<OrdersServices>,
    @InjectRepository(OrdersServicesProducts) private readonly ospRepo: Repository<OrdersServicesProducts>,
    @InjectRepository(OrdersServicesHistory) private readonly historyRepo: Repository<OrdersServicesHistory>,
    @InjectRepository(Products) private readonly productsRepo: Repository<Products>,
    @InjectRepository(Technicians) private readonly techRepo: Repository<Technicians>,
    @InjectRepository(Customers) private readonly clientsRepo: Repository<Customers>,
    @InjectRepository(States) private readonly statesRepo: Repository<States>,
  ) {}

  private async validateOrder(id: number) {
    const order = await this.ordersRepo.findOne({
      where: { ordersservicesid: id },
      relations: ['products', 'products.product', 'technicians', 'client', 'state'],
    });
    if (!order) throw new NotFoundException('Orden no encontrada');
    order.files = Array.isArray(order.files) ? order.files : [];
    order.products = order.products ?? [];
    order.technicians = order.technicians ?? [];
    order.total = order.total ?? 0;
    return order;
  }

  private snapshot(order: OrdersServices) {
    return {
      ordersservicesid: order.ordersservicesid,
      description: order.description,
      total: order.total,
      files: order.files ?? [],
      fechainicio: order.fechainicio,
      fechafin: order.fechafin,
      horainicio: order.horainicio,
      horafin: order.horafin,
      clientid: (order.client as any)?.customerid ?? null,
      stateid: (order.state as any)?.stateid ?? null,
      technicians: (order.technicians ?? []).map((t: any) => t.technicianid),
      products: (order.products ?? []).map((p: any) => ({
        productid: (p.product as any)?.productid,
        cantidad: p.cantidad,
        subtotal: p.subtotal,
      })),
    };
  }

  private async log(
    historyRepo: Repository<OrdersServicesHistory>,
    order: OrdersServices,
    action: OrdersServicesHistoryAction,
    payload: any | null,
    actoruserid: ActorUserId,
    description?: string,
  ) {
    const actionlabel = ACTION_LABELS[action] ?? action;
    await historyRepo.save(
      historyRepo.create({
        order,
        action,
        actionlabel,
        description: description ?? null,
        payload,
        actoruserid: actoruserid ?? null,
      }),
    );
  }

  private async createCore(em: EntityManager, dto: CreateOrdersServicesDto, actoruserid?: ActorUserId): Promise<number> {
    const ordersRepo = em.getRepository(OrdersServices);
    const ospRepo = em.getRepository(OrdersServicesProducts);
    const historyRepo = em.getRepository(OrdersServicesHistory);
    const productsRepo = em.getRepository(Products);
    const techRepo = em.getRepository(Technicians);
    const clientsRepo = em.getRepository(Customers);
    const statesRepo = em.getRepository(States);

    const client = await clientsRepo.findOne({ where: { customerid: dto.clientid } });
    if (!client) throw new BadRequestException('Cliente no existe');

    const state = await statesRepo.findOne({ where: { stateid: dto.stateid } });
    if (!state) throw new BadRequestException('Estado no existe');

    const techIds = dto.technicians ?? [];
    if (techIds.length === 0) throw new BadRequestException('Debe asignar al menos un técnico');
    const technicians = await techRepo.find({ where: { technicianid: In(techIds) } });
    if (technicians.length !== techIds.length) throw new BadRequestException('Uno o más técnicos no existen');

    const items = dto.products ?? [];
    if (items.length === 0) throw new BadRequestException('Debe agregar al menos un producto');

    const order = ordersRepo.create({
      description: dto.description,
      total: 0,
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

    const seen = new Set<number>();
    let total = 0;

    for (const item of items) {
      if (seen.has(item.productid)) throw new BadRequestException('Hay productos repetidos en la orden');
      seen.add(item.productid);

      const product = await productsRepo.findOne({ where: { productid: item.productid } });
      if (!product) throw new BadRequestException('Producto no existe');

      const subtotal = product.productpriceofsale * item.cantidad;
      total += subtotal;

      await ospRepo.save(ospRepo.create({ order, product, cantidad: item.cantidad, subtotal }));
    }

    await ordersRepo.update({ ordersservicesid: order.ordersservicesid } as any, { total } as any);

    const hydrated = await ordersRepo.findOne({
      where: { ordersservicesid: order.ordersservicesid } as any,
      relations: ['products', 'products.product', 'technicians', 'client', 'state'],
    });

    await this.log(
      historyRepo,
      hydrated as any,
      'CREATE',
      { created: this.snapshot(hydrated as any) },
      actoruserid,
      'Orden creada',
    );

    return order.ordersservicesid;
  }

  async create(dto: CreateOrdersServicesDto, actoruserid?: ActorUserId) {
    const id = await this.ordersRepo.manager.transaction((em) => this.createCore(em, dto, actoruserid));
    return this.validateOrder(id);
  }

  findAll() {
    return this.ordersRepo.find({
      relations: ['products', 'products.product', 'technicians', 'client', 'state'],
    });
  }

  async findOne(id: number) {
    return this.validateOrder(id);
  }

  async history(orderId: number) {
    await this.validateOrder(orderId);
    return this.historyRepo.find({
      where: { order: { ordersservicesid: orderId } as any },
      order: { createdat: 'DESC' },
    });
  }

  async update(id: number, dto: UpdateOrdersServicesDto, actoruserid?: ActorUserId) {
    const order = await this.validateOrder(id);
    const before = this.snapshot(order);

    if (dto.description !== undefined) order.description = dto.description;

    if (dto.clientid !== undefined) {
      const client = await this.clientsRepo.findOne({ where: { customerid: dto.clientid } });
      if (!client) throw new BadRequestException('Cliente no existe');
      order.client = client;
    }

    if (dto.stateid !== undefined) {
      const state = await this.statesRepo.findOne({ where: { stateid: dto.stateid } });
      if (!state) throw new BadRequestException('Estado no existe');
      order.state = state;
    }

    if (dto.fechainicio !== undefined) order.fechainicio = dto.fechainicio as any;
    if (dto.fechafin !== undefined) order.fechafin = dto.fechafin as any;
    if (dto.horainicio !== undefined) order.horainicio = dto.horainicio;
    if (dto.horafin !== undefined) order.horafin = dto.horafin;

    if (dto.technicians !== undefined) {
      const techIds = dto.technicians ?? [];
      if (techIds.length === 0) throw new BadRequestException('Debe asignar al menos un técnico');
      const technicians = await this.techRepo.find({ where: { technicianid: In(techIds) } });
      if (technicians.length !== techIds.length) throw new BadRequestException('Uno o más técnicos no existen');
      order.technicians = technicians;
    }

    if (dto.files !== undefined) {
      const next = dto.files ?? [];
      if (!Array.isArray(next)) throw new BadRequestException('files debe ser un arreglo de links');
      order.files = next;
    }

    await this.ordersRepo.save(order);

    const afterOrder = await this.validateOrder(id);
    const after = this.snapshot(afterOrder);

    await this.log(this.historyRepo, afterOrder, 'UPDATE', { before, after, patch: dto }, actoruserid, 'Orden actualizada');

    return afterOrder;
  }

  async remove(id: number, actoruserid?: ActorUserId) {
    const order = await this.validateOrder(id);
    await this.log(this.historyRepo, order, 'DELETE', { deleted: this.snapshot(order) }, actoruserid, 'Orden eliminada');
    return this.ordersRepo.remove(order);
  }

  async addProduct(orderId: number, dto: AddProductDto, actoruserid?: ActorUserId) {
    const order = await this.validateOrder(orderId);

    const existing = (order.products ?? []).find((p) => (p.product as any).productid === dto.productid);
    if (existing) throw new BadRequestException('El producto ya está agregado');

    const product = await this.productsRepo.findOne({ where: { productid: dto.productid } });
    if (!product) throw new BadRequestException('Producto no existe');

    const subtotal = product.productpriceofsale * dto.cantidad;

    await this.ospRepo.save(
      this.ospRepo.create({
        order: { ordersservicesid: orderId } as any,
        product,
        cantidad: dto.cantidad,
        subtotal,
      }),
    );

    const newTotal = (order.total ?? 0) + subtotal;
    await this.ordersRepo.update({ ordersservicesid: orderId } as any, { total: newTotal } as any);

    const hydrated = await this.validateOrder(orderId);

    await this.log(
      this.historyRepo,
      hydrated,
      'ADD_PRODUCT',
      { productid: dto.productid, cantidad: dto.cantidad, subtotal, total: newTotal },
      actoruserid,
      'Producto agregado',
    );

    return hydrated;
  }

  async removeProduct(orderId: number, productId: number, actoruserid?: ActorUserId) {
    const order = await this.validateOrder(orderId);

    const osp = (order.products ?? []).find((p) => (p.product as any).productid === productId);
    if (!osp) throw new BadRequestException('El producto no está en la orden');

    await this.ospRepo.remove(osp);

    const updatedProducts = await this.ospRepo.find({
      where: { order: { ordersservicesid: orderId } as any },
      relations: ['product', 'order'],
    });

    const updatedTotal = updatedProducts.reduce((sum, item) => sum + (item.subtotal ?? 0), 0);
    await this.ordersRepo.update({ ordersservicesid: orderId } as any, { total: updatedTotal } as any);

    const hydrated = await this.validateOrder(orderId);

    await this.log(
      this.historyRepo,
      hydrated,
      'REMOVE_PRODUCT',
      { productid: productId, removedSubtotal: osp.subtotal, total: updatedTotal },
      actoruserid,
      'Producto eliminado',
    );

    return hydrated;
  }

  async assignTechnicians(orderId: number, dto: AssignTechniciansDto, actoruserid?: ActorUserId) {
    const order = await this.validateOrder(orderId);

    const techIds = dto.technicians ?? [];
    if (techIds.length === 0) throw new BadRequestException('Debe asignar al menos un técnico');

    const technicians = await this.techRepo.find({ where: { technicianid: In(techIds) } });
    if (technicians.length !== techIds.length) throw new BadRequestException('Uno o más técnicos no existen');

    order.technicians = technicians;
    await this.ordersRepo.save(order);

    const hydrated = await this.validateOrder(orderId);

    await this.log(
      this.historyRepo,
      hydrated,
      'ASSIGN_TECHNICIANS',
      { technicians: techIds },
      actoruserid,
      'Técnicos asignados',
    );

    return hydrated;
  }

  async finishOrder(id: number, dto: FinishOrderDto, actoruserid?: ActorUserId) {
    const order = await this.validateOrder(id);

    if ((order.products ?? []).length === 0) throw new BadRequestException('No puede finalizar sin productos');
    if (!order.technicians || order.technicians.length === 0) throw new BadRequestException('No puede finalizar sin técnicos');

    order.horafin = dto.horafin;
    order.fechafin = dto.fechafin as any;

    const finishedState = await this.statesRepo.findOne({ where: { name: 'Finished' } });
    if (finishedState) order.state = finishedState;

    await this.ordersRepo.save(order);

    const hydrated = await this.validateOrder(id);

    await this.log(
      this.historyRepo,
      hydrated,
      'FINISH',
      {
        fechafin: dto.fechafin,
        horafin: dto.horafin,
        stateid: finishedState ? (finishedState as any).stateid : null,
      },
      actoruserid,
      'Orden finalizada',
    );

    return hydrated;
  }

  async reprogram(id: number, dto: ReprogramOrderDto, actoruserid?: ActorUserId) {
    const order = await this.validateOrder(id);

    const beforeSchedule = {
      fechainicio: order.fechainicio,
      fechafin: order.fechafin,
      horainicio: order.horainicio,
      horafin: order.horafin,
    };

    order.fechainicio = dto.fechainicio as any;
    order.fechafin = dto.fechafin as any;
    order.horainicio = dto.horainicio;
    order.horafin = dto.horafin;

    await this.ordersRepo.save(order);

    const hydrated = await this.validateOrder(id);

    const payload = {
      from: beforeSchedule,
      to: {
        fechainicio: hydrated.fechainicio,
        fechafin: hydrated.fechafin,
        horainicio: hydrated.horainicio,
        horafin: hydrated.horafin,
      },
      reason: dto.reason ?? null,
    };

    const description = dto.reason ? `Orden reprogramada: ${dto.reason}` : 'Orden reprogramada';

    await this.log(this.historyRepo, hydrated, 'REPROGRAM', payload, actoruserid, description);

    return hydrated;
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

  async addFile(orderId: number, dto: AddFileDto, actoruserid?: ActorUserId) {
    const order = await this.validateOrder(orderId);
    const files = order.files ?? [];
    const url = dto.url?.trim();

    if (!url) throw new BadRequestException('url es obligatorio');
    if (files.includes(url)) throw new BadRequestException('Ese link ya está agregado');

    order.files = [...files, url];
    await this.ordersRepo.save(order);

    const hydrated = await this.validateOrder(orderId);

    await this.log(this.historyRepo, hydrated, 'ADD_FILE', { url, count: hydrated.files.length }, actoruserid, 'Archivo agregado');

    return hydrated;
  }

  async removeFileByIndex(orderId: number, index: number, actoruserid?: ActorUserId) {
    const order = await this.validateOrder(orderId);
    const files = [...(order.files ?? [])];

    if (index < 0 || index >= files.length) throw new NotFoundException('Archivo no encontrado');

    const removed = files.splice(index, 1)[0];
    order.files = files;

    await this.ordersRepo.save(order);

    const hydrated = await this.validateOrder(orderId);

    await this.log(
      this.historyRepo,
      hydrated,
      'REMOVE_FILE',
      { url: removed, index, count: hydrated.files.length },
      actoruserid,
      'Archivo eliminado',
    );

    return hydrated;
  }

  async removeFile(orderId: number, dto: RemoveFileDto, actoruserid?: ActorUserId) {
    const order = await this.validateOrder(orderId);
    const url = dto.url?.trim();
    if (!url) throw new BadRequestException('url es obligatorio');

    const files = order.files ?? [];
    const idx = files.indexOf(url);
    if (idx === -1) throw new NotFoundException('Archivo no encontrado');

    order.files = files.filter((u) => u !== url);

    await this.ordersRepo.save(order);

    const hydrated = await this.validateOrder(orderId);

    await this.log(
      this.historyRepo,
      hydrated,
      'REMOVE_FILE',
      { url, index: idx, count: hydrated.files.length },
      actoruserid,
      'Archivo eliminado',
    );

    return hydrated;
  }

  findByTechnician(technicianId: number) {
    return this.ordersRepo
      .createQueryBuilder('o')
      .leftJoinAndSelect('o.technicians', 't')
      .leftJoinAndSelect('o.client', 'client')
      .leftJoinAndSelect('o.state', 'state')
      .leftJoinAndSelect('o.products', 'p')
      .leftJoinAndSelect('p.product', 'product')
      .where('t.technicianid = :id', { id: technicianId })
      .getMany();
  }

  findByClient(clientId: number) {
    return this.ordersRepo.find({
      where: { client: { customerid: clientId } as any },
      relations: ['technicians', 'products', 'products.product', 'client', 'state'],
    });
  }

  findByState(stateId: number) {
    return this.ordersRepo.find({
      where: { state: { stateid: stateId } as any },
      relations: ['technicians', 'products', 'products.product', 'client', 'state'],
    });
  }

  findByDateRange(from: string, to: string) {
    return this.ordersRepo.find({
      where: { fechainicio: Between(from as any, to as any) },
      relations: ['technicians', 'products', 'products.product', 'client', 'state'],
    });
  }
}
