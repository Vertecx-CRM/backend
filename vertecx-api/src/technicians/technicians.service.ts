import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';

import { Technicians } from './entities/technicians.entity';
import { TechnicianTypeMap } from 'src/shared/entities/technician-type-map.entity';
import { CreateTechnicianDto } from './dto/create-technician.dto';
import { UpdateTechnicianDto } from './dto/update-technician.dto';
import { UsersService } from 'src/users/users.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';

@Injectable()
export class TechniciansService {
  private cachedTechRoleId: number | null = null;

  constructor(
    @InjectRepository(Technicians)
    private readonly techniciansRepo: Repository<Technicians>,

    @InjectRepository(TechnicianTypeMap)
    private readonly typeMapRepo: Repository<TechnicianTypeMap>,

    private readonly usersService: UsersService,
  ) {}

  private async getTechRoleId(): Promise<number> {
    if (this.cachedTechRoleId) return this.cachedTechRoleId;
    const id = await this.usersService.getRoleIdByName('Técnico');
    this.cachedTechRoleId = id;
    return id;
  }

  async create(dto: CreateTechnicianDto) {
    const TECH_ROLE_ID = dto.roleid ?? (await this.getTechRoleId());
    const ACTIVE_STATE_ID = 1;

    const userDto: CreateUserDto = {
      name: dto.name,
      lastname: dto.lastname,
      email: dto.email,
      documentnumber: dto.documentnumber,
      phone: dto.phone,
      typeid: dto.typeid,
      stateid: ACTIVE_STATE_ID,
      roleid: TECH_ROLE_ID,
      image: dto.image,
      CV: dto.CV,
      techniciantypeids: dto.techniciantypeids,
    };

    return this.usersService.create(userDto);
  }

  /**
   * IMPORTANTE:
   * Cambiamos leftJoinAndSelect('tech.users','u') -> leftJoin('tech.users','u')
   * para evitar que TypeORM seleccione automáticamente todas las columnas de Users
   * (como password). Solo viaja lo que pongamos en qb.select([...]).
   */
  private baseQb() {
    const qb = this.techniciansRepo
      .createQueryBuilder('tech')
      .leftJoin('tech.users', 'u')
      .leftJoin('u.typeofdocuments', 'doc')
      .leftJoin('u.states', 'st')
      .leftJoin('u.roles', 'r')
      .leftJoin('tech.technicianTypeMaps', 'tm')
      .leftJoin('tm.techniciantype', 'tt');

    qb.select([
      // technicians
      'tech.technicianid',
      'tech.userid',
      'tech.CV',

      // users (solo lo que usa tu UI)
      'u.userid',
      'u.name',
      'u.lastname',
      'u.email',
      'u.documentnumber',
      'u.phone',
      'u.image',
      'u.typeid',
      'u.stateid',
      'u.roleid',

      // typeofdocuments
      'doc.typeofdocumentid',
      'doc.name',

      // states
      'st.stateid',
      'st.name',

      // roles
      'r.roleid',
      'r.name',
      'r.status',

      // type map + techniciantypes
      'tm.technicianid',
      'tm.techniciantypeid',
      'tt.techniciantypeid',
      'tt.name',
      'tt.stateid',
    ]);

    return qb;
  }

  async findAll() {
    return this.baseQb()
      .orderBy('tech.technicianid', 'DESC')
      .addOrderBy('tt.name', 'ASC')
      .getMany();
  }

  async findOne(id: number) {
    const technician = await this.baseQb()
      .where('tech.technicianid = :id', { id })
      .getOne();

    if (!technician) throw new NotFoundException('Técnico no encontrado');

    technician.technicianTypeMaps = (technician.technicianTypeMaps ?? []).sort((a, b) =>
      (a.techniciantype?.name ?? '').localeCompare(b.techniciantype?.name ?? ''),
    );

    return technician;
  }

  async update(technicianId: number, dto: UpdateTechnicianDto) {
    const tech = await this.techniciansRepo.findOne({
      where: { technicianid: technicianId },
      select: ['technicianid', 'userid'],
    });

    if (!tech) throw new NotFoundException('Técnico no encontrado');

    const userDto: UpdateUserDto = {};

    if (dto.name !== undefined) userDto.name = dto.name;
    if (dto.lastname !== undefined) userDto.lastname = dto.lastname;
    if (dto.email !== undefined) userDto.email = dto.email;
    if (dto.documentnumber !== undefined) userDto.documentnumber = dto.documentnumber;
    if (dto.phone !== undefined) userDto.phone = dto.phone;
    if (dto.image !== undefined) userDto.image = dto.image;
    if (dto.CV !== undefined) userDto.CV = dto.CV;

    if (dto.typeid !== undefined) userDto.typeid = dto.typeid;
    if (dto.stateid !== undefined) userDto.stateid = dto.stateid;

    if (dto.techniciantypeids !== undefined) {
      userDto.techniciantypeids = dto.techniciantypeids;
    }
    if (dto.roleid !== undefined) {
      userDto.roleid = dto.roleid;
    }

    await this.usersService.update(tech.userid, userDto);

    return this.findOne(technicianId);
  }

  async remove(technicianId: number) {
    const tech = await this.techniciansRepo.findOne({
      where: { technicianid: technicianId },
      select: ['technicianid', 'userid'],
    });

    if (!tech) throw new NotFoundException('Técnico no encontrado');

    await this.typeMapRepo.delete({ technicianid: technicianId });

    try {
      await this.usersService.remove(tech.userid);
      return { message: 'Técnico eliminado correctamente' };
    } catch (e) {
      if (e instanceof QueryFailedError) {
        const err: any = e;
        if (err?.driverError?.code === '23503') {
          throw new ConflictException(
            'No se puede eliminar el técnico porque está asociado a una orden de servicio u otro registro.',
          );
        }
      }
      throw e;
    }
  }
}