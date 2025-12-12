// purchase-orders/purchase-orders.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PurchaseOrder } from '../shared/entities/purchase-order.entity';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';

@Injectable()
export class PurchaseOrdersService {
  constructor(
    @InjectRepository(PurchaseOrder)
    private readonly purchaseOrderRepo: Repository<PurchaseOrder>,
  ) {}

  async create(dto: CreatePurchaseOrderDto): Promise<PurchaseOrder> {
    // Verificar si ya existe el número de orden
    const existing = await this.purchaseOrderRepo.findOne({
      where: { orderNumber: dto.orderNumber },
    });
    
    if (existing) {
      throw new NotFoundException(`Order number ${dto.orderNumber} already exists`);
    }

    const purchaseOrder = this.purchaseOrderRepo.create(dto);
    return await this.purchaseOrderRepo.save(purchaseOrder);
  }

  async findAll(): Promise<PurchaseOrder[]> {
    return await this.purchaseOrderRepo.find({
      relations: ['state', 'supplier'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<PurchaseOrder> {
    const purchaseOrder = await this.purchaseOrderRepo.findOne({
      where: { id },
      relations: ['state', 'supplier'],
    });

    if (!purchaseOrder) {
      throw new NotFoundException(`Purchase Order with ID ${id} not found`);
    }

    return purchaseOrder;
  }

  async update(id: number, dto: UpdatePurchaseOrderDto): Promise<PurchaseOrder> {
    const purchaseOrder = await this.findOne(id);
    
    // Si se actualiza orderNumber, verificar que no exista
    if (dto.orderNumber && dto.orderNumber !== purchaseOrder.orderNumber) {
      const existing = await this.purchaseOrderRepo.findOne({
        where: { orderNumber: dto.orderNumber },
      });
      
      if (existing && existing.id !== id) {
        throw new NotFoundException(`Order number ${dto.orderNumber} already exists`);
      }
    }
    
    Object.assign(purchaseOrder, dto);
    return await this.purchaseOrderRepo.save(purchaseOrder);
  }

  async remove(id: number): Promise<{ message: string }> {
    const purchaseOrder = await this.findOne(id);
    await this.purchaseOrderRepo.remove(purchaseOrder);
    return { message: `Purchase Order ${id} deleted successfully` };
  }

  async findByOrderNumber(orderNumber: string): Promise<PurchaseOrder> {
    const purchaseOrder = await this.purchaseOrderRepo.findOne({
      where: { orderNumber },
      relations: ['state', 'supplier'],
    });

    if (!purchaseOrder) {
      throw new NotFoundException(
        `Purchase Order with number ${orderNumber} not found`,
      );
    }

    return purchaseOrder;
  }

  async findBySupplier(supplierId: number): Promise<PurchaseOrder[]> {
    return await this.purchaseOrderRepo.find({
      where: { supplierId },
      relations: ['state', 'supplier'],
      order: { orderDate: 'DESC' },
    });
  }

  async findByState(stateId: number): Promise<PurchaseOrder[]> {
    return await this.purchaseOrderRepo.find({
      where: { stateId },
      relations: ['state', 'supplier'],
      order: { orderDate: 'DESC' },
    });
  }
}