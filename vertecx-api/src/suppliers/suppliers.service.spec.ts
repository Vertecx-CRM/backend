import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Suppliers } from './entities/suppliers.entity';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(@InjectRepository(Suppliers) private readonly repo: Repository<Suppliers>) {}

  async create(dto: CreateSupplierDto): Promise<Suppliers> {
    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }

  async findAll(): Promise<Suppliers[]> {
    return this.repo.find();
  }

  async findOne(id: number): Promise<Suppliers> {
    const entity = await this.repo.findOne({ where: { supplierid: id } });
    if (!entity) throw new NotFoundException('Supplier not found');
    return entity;
  }

  async update(id: number, dto: UpdateSupplierDto): Promise<Suppliers> {
    const entity = await this.repo.preload({ supplierid: id, ...dto });
    if (!entity) throw new NotFoundException('Supplier not found');
    return this.repo.save(entity);
  }

  async remove(id: number): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
