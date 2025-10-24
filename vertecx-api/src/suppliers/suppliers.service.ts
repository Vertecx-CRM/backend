import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Suppliers } from './entities/suppliers.entity';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { Users } from 'src/users/entities/users.entity';
import { States } from 'src/shared/entities/states.entity';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Suppliers) private readonly repo: Repository<Suppliers>,
    @InjectRepository(Users) private readonly usersRepo: Repository<Users>,
    @InjectRepository(States) private readonly statesRepo: Repository<States>,
  ) {}

  private async ensureUserAndState(userid: number, stateid: number) {
    const user = await this.usersRepo.findOne({ where: { userid } });
    if (!user) throw new BadRequestException('El usuario no existe');
    const state = await this.statesRepo.findOne({ where: { stateid } });
    if (!state) throw new BadRequestException('El estado no existe');
  }

  private async ensureNitUnique(nit: string, excludeId?: number) {
    const qb = this.repo.createQueryBuilder('s').where('s.nit = :nit', { nit });
    if (excludeId) qb.andWhere('s.supplierid <> :id', { id: excludeId });
    const exists = await qb.getExists();
    if (exists) throw new BadRequestException('El NIT ya está registrado');
  }

  async create(dto: CreateSupplierDto): Promise<Suppliers> {
    await this.ensureUserAndState(dto.userid, dto.stateid);
    await this.ensureNitUnique(dto.nit);
    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }

  async createMany(dtos: CreateSupplierDto[]): Promise<Suppliers[]> {
    for (const d of dtos) {
      await this.ensureUserAndState(d.userid, d.stateid);
      await this.ensureNitUnique(d.nit);
    }
    const entities = this.repo.create(dtos);
    return this.repo.save(entities);
  }

  async findAll(): Promise<Suppliers[]> {
    return this.repo.find();
  }

  async findOne(id: number): Promise<Suppliers> {
    const entity = await this.repo.findOne({ where: { supplierid: id } });
    if (!entity) throw new NotFoundException('Proveedor no encontrado');
    return entity;
  }

  async update(id: number, dto: UpdateSupplierDto): Promise<Suppliers> {
    const current = await this.findOne(id);
    const userid = dto.userid ?? current.userid;
    const stateid = dto.stateid ?? current.stateid;
    await this.ensureUserAndState(userid, stateid);
    if (dto.nit) await this.ensureNitUnique(dto.nit, id);
    const entity = await this.repo.preload({ supplierid: id, ...dto });
    if (!entity) throw new NotFoundException('Proveedor no encontrado');
    return this.repo.save(entity);
  }

  async remove(id: number): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
