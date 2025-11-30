import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Between } from 'typeorm';

import { OrdersServices } from './entities/orders-services.entity';
import { OrdersServicesProducts } from './entities/orders-services-products.entity';
import { Products } from 'src/products/entities/products.entity';
import { Technicians } from 'src/technicians/entities/technicians.entity';
import { Customers } from 'src/customers/entities/customers.entity';
import { States } from 'src/shared/entities/states.entity';

import { CreateOrdersServicesDto } from './dto/create-orders-services.dto';
import { UpdateOrdersServicesDto } from './dto/update-orders-services.dto';
import { AddProductDto } from './dto/add-product.dto';
import { AssignTechniciansDto } from './dto/assign-technicians.dto';
import { FinishOrderDto } from './dto/finish-order.dto';

@Injectable()
export class OrdersServicesService {
  constructor(
    @InjectRepository(OrdersServices) private readonly ordersRepo: Repository<OrdersServices>,
    @InjectRepository(OrdersServicesProducts) private readonly ospRepo: Repository<OrdersServicesProducts>,
    @InjectRepository(Products) private readonly productsRepo: Repository<Products>,
    @InjectRepository(Technicians) private readonly techRepo: Repository<Technicians>,
    @InjectRepository(Customers) private readonly clientsRepo: Repository<Customers>,
    @InjectRepository(States) private readonly statesRepo: Repository<States>,
  ) {}

  private async validateOrder(id: number) {
    const order = await this.ordersRepo.findOne({
      where: { ordersservicesid: id },
      relations: [
        'products',
        'products.product',
        'technicians',
        'technicians.users',
        'client',
        'client.users',
        'state',
      ],
    });
    if (!order) throw new NotFoundException('Orden no encontrada');
    return order;
  }

  async create(dto: CreateOrdersServicesDto) {
    const client = await this.clientsRepo.findOne({ where: { customerid: dto.clientid } });
    if (!client) throw new BadRequestException('Cliente no existe');

    const state = await this.statesRepo.findOne({ where: { stateid: dto.stateid } });
    if (!state) throw new BadRequestException('Estado no existe');

    const technicians = await this.techRepo.find({ where: { technicianid: In(dto.technicians) } });
    if (technicians.length !== dto.technicians.length) throw new BadRequestException('Uno o más técnicos no existen');

    const order = this.ordersRepo.create({
      description: dto.description,
      total: 0,
      files: dto.files ?? [],
      client,
      state,
      fechainicio: new Date(dto.fechainicio),
      fechafin: new Date(dto.fechafin),
      horainicio: dto.horainicio,
      horafin: dto.horafin,
      technicians,
    });

    await this.ordersRepo.save(order);

    let total = 0;

    for (const item of dto.products) {
      const product = await this.productsRepo.findOne({ where: { productid: item.productid } });
      if (!product) throw new BadRequestException('Producto no existe');

      const subtotal = product.productpriceofsale * item.cantidad;
      total += subtotal;

      const osp = this.ospRepo.create({
        order,
        product,
        cantidad: item.cantidad,
        subtotal,
      });

      await this.ospRepo.save(osp);
    }

    order.total = total;
    await this.ordersRepo.save(order);

    return this.findOne(order.ordersservicesid);
  }

  findAll() {
    return this.ordersRepo.find({
      relations: [
        'products',
        'products.product',
        'technicians',
        'technicians.users',
        'client',
        'client.users',
        'state',
      ],
    });
  }

  async findOne(id: number) {
    return this.validateOrder(id);
  }

  async update(id: number, dto: UpdateOrdersServicesDto) {
    const order = await this.validateOrder(id);
    Object.assign(order, dto);
    return this.ordersRepo.save(order);
  }

  async remove(id: number) {
    const order = await this.validateOrder(id);
    return this.ordersRepo.remove(order);
  }

  async addProduct(orderId: number, dto: AddProductDto) {
    const order = await this.validateOrder(orderId);

    const existing = order.products.find(p => p.product.productid === dto.productid);
    if (existing) throw new BadRequestException('El producto ya está agregado');

    const product = await this.productsRepo.findOne({ where: { productid: dto.productid } });
    if (!product) throw new BadRequestException('Producto no existe');

    const subtotal = product.productpriceofsale * dto.cantidad;

    const osp = this.ospRepo.create({
      order,
      product,
      cantidad: dto.cantidad,
      subtotal,
    });

    await this.ospRepo.save(osp);

    order.total = order.total + subtotal;
    await this.ordersRepo.save(order);

    return this.findOne(orderId);
  }

  async removeProduct(orderId: number, productId: number) {
    const order = await this.validateOrder(orderId);

    const osp = order.products.find(p => p.product.productid === productId);
    if (!osp) throw new BadRequestException('El producto no está en la orden');

    await this.ospRepo.remove(osp);

    const updatedProducts = await this.ospRepo.find({
      where: { order: { ordersservicesid: orderId } },
    });

    const updatedTotal = updatedProducts.reduce((sum, item) => sum + item.subtotal, 0);

    order.total = updatedTotal;
    await this.ordersRepo.save(order);

    return this.findOne(orderId);
  }

  async assignTechnicians(orderId: number, dto: AssignTechniciansDto) {
    const order = await this.validateOrder(orderId);

    const technicians = await this.techRepo.find({
      where: { technicianid: In(dto.technicians) },
    });

    if (technicians.length !== dto.technicians.length)
      throw new BadRequestException('Uno o más técnicos no existen');

    order.technicians = technicians;
    await this.ordersRepo.save(order);

    return this.findOne(orderId);
  }

  async finishOrder(id: number, dto: FinishOrderDto) {
    const order = await this.validateOrder(id);

    if (order.products.length === 0)
      throw new BadRequestException('No puede finalizar sin productos');

    if (!order.technicians || order.technicians.length === 0)
      throw new BadRequestException('No puede finalizar sin técnicos');

    order.horafin = dto.horafin;
    order.fechafin = new Date(dto.fechafin);

    const finishedState = await this.statesRepo.findOne({
      where: { name: 'Finished' },
    });

    if (finishedState) order.state = finishedState;

    return this.ordersRepo.save(order);
  }

  findByTechnician(technicianId: number) {
    return this.ordersRepo
      .createQueryBuilder('o')
      .leftJoinAndSelect('o.technicians', 't')
      .leftJoinAndSelect('o.products', 'p')
      .leftJoinAndSelect('p.product', 'product')
      .where('t.technicianid = :id', { id: technicianId })
      .getMany();
  }

  findByClient(clientId: number) {
    return this.ordersRepo.find({
      where: { client: { customerid: clientId } },
      relations: ['technicians', 'products', 'products.product'],
    });
  }

  findByState(stateId: number) {
    return this.ordersRepo.find({
      where: { state: { stateid: stateId } },
      relations: ['technicians', 'products', 'products.product'],
    });
  }

  findByDateRange(from: string, to: string) {
    return this.ordersRepo.find({
      where: { fechainicio: Between(new Date(from), new Date(to)) },
      relations: ['technicians', 'products', 'products.product'],
    });
  }
}
