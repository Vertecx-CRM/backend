import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
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

  // CREATE
  async create(dto: CreatePurchaseOrderDto): Promise<PurchaseOrder> {
    const existing = await this.purchaseOrderRepo.findOne({
      where: { numeroOrden: dto.numeroOrden },
    });

    if (existing) {
      throw new ConflictException(
        `El número de orden ${dto.numeroOrden} ya existe`,
      );
    }

    const subtotal = dto.precioUnitario * dto.cantidad;
    const iva = subtotal * 0.19;
    const total = subtotal + iva;

    const purchaseOrder = this.purchaseOrderRepo.create({
      numeroOrden: dto.numeroOrden,
      proveedorId: dto.proveedorId,
      estadoId: dto.estadoId ?? 1, // Pendiente por defecto
      fecha: dto.fecha,
      precioUnitario: dto.precioUnitario,
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
    return await this.purchaseOrderRepo.find({
      relations: ['state', 'supplier'],
      order: { createdAt: 'DESC' },
    });
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
  async findByNumeroOrden(numeroOrden: string): Promise<PurchaseOrder> {
    const purchaseOrder = await this.purchaseOrderRepo.findOne({
      where: { numeroOrden },
      relations: ['state', 'supplier'],
    });

    if (!purchaseOrder) {
      throw new NotFoundException(
        `Orden de compra ${numeroOrden} no encontrada`,
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
      dto.numeroOrden !== purchaseOrder.numeroOrden
    ) {
      const existing = await this.purchaseOrderRepo.findOne({
        where: { numeroOrden: dto.numeroOrden },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException(
          `El número de orden ${dto.numeroOrden} ya existe`,
        );
      }

      purchaseOrder.numeroOrden = dto.numeroOrden;
    }

    if (dto.fecha) purchaseOrder.fecha = dto.fecha;
    if (dto.precioUnitario !== undefined)
      purchaseOrder.precioUnitario = dto.precioUnitario;
    if (dto.cantidad !== undefined)
      purchaseOrder.cantidad = dto.cantidad;
    if (dto.descripcion !== undefined)
      purchaseOrder.descripcion = dto.descripcion;
    if (dto.estadoId !== undefined)
      purchaseOrder.estadoId = dto.estadoId;
    if (dto.proveedorId !== undefined)
      purchaseOrder.proveedorId = dto.proveedorId;

    if (
      dto.precioUnitario !== undefined ||
      dto.cantidad !== undefined
    ) {
      const subtotal =
        purchaseOrder.precioUnitario * purchaseOrder.cantidad;
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

    purchaseOrder.estadoId = 3; // 3 = Anulada (ajusta según tu tabla states)
    purchaseOrder.descripcion = motivo;

    return await this.purchaseOrderRepo.save(purchaseOrder);
  }

  // DELETE (TEMPORAL)
  async remove(id: number): Promise<{ message: string }> {
    const purchaseOrder = await this.findOne(id);
    await this.purchaseOrderRepo.remove(purchaseOrder);

    return {
      message: `Orden de compra ${id} eliminada correctamente`,
    };
  }

  // FIND BY SUPPLIER
  async findBySupplier(
    proveedorId: number,
  ): Promise<PurchaseOrder[]> {
    return await this.purchaseOrderRepo.find({
      where: { proveedorId },
      relations: ['state', 'supplier'],
      order: { fecha: 'DESC' },
    });
  }

  // FIND BY STATE
  async findByState(
    estadoId: number,
  ): Promise<PurchaseOrder[]> {
    return await this.purchaseOrderRepo.find({
      where: { estadoId },
      relations: ['state', 'supplier'],
      order: { fecha: 'DESC' },
    });
  }
}
