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
import { Users } from 'src/users/entities/users.entity';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Suppliers)
    private readonly repo: Repository<Suppliers>,

    @InjectRepository(Users)
    private readonly usersRepo: Repository<Users>,
  ) {}

  /** 🧩 Verifica que el usuario exista antes de asociarlo */
  private async ensureUserExists(userid: number) {
    const user = await this.usersRepo.findOne({ where: { userid } });
    if (!user) throw new BadRequestException('El usuario no existe');
    return user;
  }

  /** 🧩 Verifica que el NIT no esté repetido */
  private async ensureNitUnique(nit: string, excludeId?: number) {
    const qb = this.repo.createQueryBuilder('s').where('s.nit = :nit', { nit });
    if (excludeId) qb.andWhere('s.supplierid <> :id', { id: excludeId });
    const exists = await qb.getExists();
    if (exists) throw new BadRequestException('El NIT ya está registrado');
  }

  /** 🧠 Crear un nuevo proveedor */
  async create(dto: CreateSupplierDto): Promise<Suppliers> {
    const user = await this.ensureUserExists(dto.userid);
    await this.ensureNitUnique(dto.nit);

    const entity = this.repo.create({
      servicetype: dto.servicetype,
      contactname: dto.contactname,
      nit: dto.nit,
      address: dto.address,
      rating: dto.rating ?? 0,
      user,
    });

    return await this.repo.save(entity);
  }

  /** 🧠 Crear varios proveedores */
  async createMany(dtos: CreateSupplierDto[]): Promise<Suppliers[]> {
    const entities: Suppliers[] = [];

    for (const dto of dtos) {
      const user = await this.ensureUserExists(dto.userid);
      await this.ensureNitUnique(dto.nit);

      const entity = this.repo.create({
        servicetype: dto.servicetype,
        contactname: dto.contactname,
        nit: dto.nit,
        address: dto.address,
        rating: dto.rating ?? 0,
        user,
      });

      entities.push(entity);
    }

    return await this.repo.save(entities);
  }

  /** 🧠 Obtener todos */
  async findAll(): Promise<Suppliers[]> {
    return await this.repo.find({ relations: ['user'] });
  }

  /** 🧠 Buscar uno por ID */
  async findOne(id: number): Promise<Suppliers> {
    const entity = await this.repo.findOne({
      where: { supplierid: id },
      relations: ['user'],
    });
    if (!entity) throw new NotFoundException('Proveedor no encontrado');
    return entity;
  }

  /** 🧠 Actualizar */
  async update(id: number, dto: UpdateSupplierDto): Promise<Suppliers> {
    const current = await this.findOne(id);
    if (dto.nit) await this.ensureNitUnique(dto.nit, id);

    // Si se envía un nuevo userid, busca el usuario
    let user = current.user;
    if (dto.userid && dto.userid !== current.user.userid) {
      user = await this.ensureUserExists(dto.userid);
    }

    const entity = await this.repo.preload({
      supplierid: id,
      servicetype: dto.servicetype ?? current.servicetype,
      contactname: dto.contactname ?? current.contactname,
      nit: dto.nit ?? current.nit,
      address: dto.address ?? current.address,
      rating: dto.rating ?? current.rating,
      user,
    });

    if (!entity) throw new NotFoundException('Proveedor no encontrado');
    return await this.repo.save(entity);
  }

  /** 🧠 Eliminar */
  async remove(id: number): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
