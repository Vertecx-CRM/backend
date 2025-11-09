import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Suppliers } from './entities/suppliers.entity';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { States } from 'src/shared/entities/states.entity';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Suppliers)
    private readonly supplierRepo: Repository<Suppliers>,

    @InjectRepository(States)
    private readonly stateRepo: Repository<States>,
  ) {}

  /** 🧩 Verifica que el estado exista */
  private async ensureStateExists(stateId: number) {
    const state = await this.stateRepo.findOne({ where: { stateid: stateId } });
    if (!state) throw new BadRequestException('El estado no existe');
    return state;
  }

  /** 🧩 Verifica que el NIT sea único */
  private async ensureNitUnique(nit: string, excludeId?: number) {
    const qb = this.supplierRepo.createQueryBuilder('s').where('s.nit = :nit', {
      nit,
    });
    if (excludeId) qb.andWhere('s.supplierid <> :id', { id: excludeId });
    const exists = await qb.getExists();
    if (exists) throw new BadRequestException('El NIT ya está registrado');
  }

  /** 🧠 Crear proveedor */
  async create(dto: CreateSupplierDto): Promise<Suppliers> {
    await this.ensureNitUnique(dto.nit);
    await this.ensureStateExists(dto.state);

    const supplier = this.supplierRepo.create({
      ...dto,
      createat: dto.createat ?? new Date(),
      updateat: dto.updateat ?? new Date(),
    });

    return await this.supplierRepo.save(supplier);
  }

  /** 🧠 Obtener todos los proveedores */
  async findAll(): Promise<Suppliers[]> {
    return await this.supplierRepo.find({
      relations: ['stateRelation'],
    });
  }

  /** 🧠 Buscar proveedor por ID */
  async findOne(id: number): Promise<Suppliers> {
    const supplier = await this.supplierRepo.findOne({
      where: { supplierid: id },
      relations: ['stateRelation'],
    });

    if (!supplier) throw new NotFoundException('Proveedor no encontrado');
    return supplier;
  }

  /** 🧠 Actualizar proveedor */
  async update(id: number, dto: UpdateSupplierDto): Promise<Suppliers> {
    const supplier = await this.findOne(id);
    if (dto.nit) await this.ensureNitUnique(dto.nit, id);

    if (dto.state) await this.ensureStateExists(dto.state);

    const updated = this.supplierRepo.merge(supplier, {
      ...dto,
      updateat: new Date(),
    });

    return await this.supplierRepo.save(updated);
  }

  /** 🧠 Eliminar proveedor */
  async remove(id: number): Promise<void> {
    const supplier = await this.findOne(id);
    await this.supplierRepo.remove(supplier);
  }
}
