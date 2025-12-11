import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Suppliers } from './entities/suppliers.entity';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { States } from 'src/shared/entities/states.entity';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Suppliers) private readonly repo: Repository<Suppliers>,
    @InjectRepository(States) private readonly statesRepo: Repository<States>,
  ) {}

  private async ensureState(stateid: number) {
    const state = await this.statesRepo.findOne({ where: { stateid } as any });
    if (!state) throw new BadRequestException('stateid no existe');
  }

  private async ensureUnique(dto: { nit?: string; phone?: string; email?: string }, excludeId?: number) {
    if (dto.nit) {
      const q = this.repo.createQueryBuilder('s').where('s.nit = :nit', { nit: dto.nit });
      if (excludeId) q.andWhere('s.supplierid <> :id', { id: excludeId });
      if (await q.getExists()) throw new BadRequestException('NIT ya registrado');
    }
    if (dto.phone) {
      const q = this.repo.createQueryBuilder('s').where('s.phone = :phone', { phone: dto.phone });
      if (excludeId) q.andWhere('s.supplierid <> :id', { id: excludeId });
      if (await q.getExists()) throw new BadRequestException('Teléfono ya registrado');
    }
    if (dto.email) {
      const q = this.repo.createQueryBuilder('s').where('s.email = :email', { email: dto.email });
      if (excludeId) q.andWhere('s.supplierid <> :id', { id: excludeId });
      if (await q.getExists()) throw new BadRequestException('Correo ya registrado');
    }
  }

  async create(dto: CreateSupplierDto) {
    await this.ensureState(dto.stateid);
    await this.ensureUnique({ nit: dto.nit, phone: dto.phone, email: dto.email });
    const entity = this.repo.create(dto);
    const saved = await this.repo.save(entity);
    const withState = await this.repo.findOne({
      where: { supplierid: saved.supplierid },
      relations: ['state'],
    });
    return { message: 'Proveedor registrado correctamente', data: withState };
  }

async findAll() {
  const data = await this.repo.find({
    relations: ['state'],
    order: { supplierid: 'ASC' },
  });
  return { message: 'OK', data };
}

  async findOne(id: number) {
    const entity = await this.repo.findOne({
      where: { supplierid: id },
      relations: ['state'],
    });
    if (!entity) throw new NotFoundException('Proveedor no encontrado');
    return { message: 'OK', data: entity };
  }

  async update(id: number, dto: UpdateSupplierDto) {
    const current = await this.repo.findOne({ where: { supplierid: id } });
    if (!current) throw new NotFoundException('Proveedor no encontrado');
    const stateid = dto.stateid ?? current.stateid;
    await this.ensureState(stateid);
    await this.ensureUnique({ nit: dto.nit, phone: dto.phone, email: dto.email }, id);
    const entity = await this.repo.preload({ supplierid: id, ...dto });
    if (!entity) throw new NotFoundException('Proveedor no encontrado');
    const saved = await this.repo.save(entity);
    const withState = await this.repo.findOne({
      where: { supplierid: saved.supplierid },
      relations: ['state'],
    });
    return { message: 'Proveedor actualizado correctamente', data: withState };
  }

  async remove(id: number) {
    const entity = await this.repo.findOne({ where: { supplierid: id } });
    if (!entity) throw new NotFoundException('Proveedor no encontrado');
    await this.repo.remove(entity);
    return { message: 'Proveedor eliminado correctamente' };
  }
}
