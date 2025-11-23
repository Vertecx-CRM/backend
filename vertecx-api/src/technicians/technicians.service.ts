import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Technicians } from './entities/technicians.entity';
import { TechnicianTypeMap } from 'src/shared/entities/technician-type-map.entity';
import { CreateTechnicianDto } from './dto/create-technician.dto';
import { UpdateTechnicianDto } from './dto/update-technician.dto';
import { UsersService } from 'src/users/users.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';

@Injectable()
export class TechniciansService {
  constructor(
    @InjectRepository(Technicians)
    private readonly techniciansRepo: Repository<Technicians>,

    @InjectRepository(TechnicianTypeMap)
    private readonly typeMapRepo: Repository<TechnicianTypeMap>,

    private readonly usersService: UsersService,
  ) {}

  async create(dto: CreateTechnicianDto) {
    const TECH_ROLE_ID =
      dto.roleid ?? (await this.usersService.getRoleIdByName('tecnico'));
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
      CV: dto.CV,
      techniciantypeids: dto.techniciantypeids,
    };

    return this.usersService.create(userDto);
  }

  async findAll() {
    return this.techniciansRepo.find({
      relations: [
        'users',
        'users.roles',
        'technicianTypeMaps',
        'technicianTypeMaps.techniciantype',
      ],
    });
  }

  async findOne(id: number) {
    const technician = await this.techniciansRepo.findOne({
      where: { technicianid: id },
      relations: [
        'users',
        'users.typeofdocuments',
        'users.states',
        'users.roles',
        'technicianTypeMaps',
        'technicianTypeMaps.techniciantype',
      ],
    });

    if (!technician) {
      throw new NotFoundException('Técnico no encontrado');
    }

    technician.technicianTypeMaps = technician.technicianTypeMaps.sort(
      (a, b) => a.techniciantype.name.localeCompare(b.techniciantype.name),
    );

    return technician;
  }

  async update(technicianId: number, dto: UpdateTechnicianDto) {
    const technician = await this.techniciansRepo.findOne({
      where: { technicianid: technicianId },
      relations: ['users'],
    });

    if (!technician) {
      throw new NotFoundException('Técnico no encontrado');
    }

    const userDto: UpdateUserDto = {};

    if (dto.name !== undefined) userDto.name = dto.name;
    if (dto.lastname !== undefined) userDto.lastname = dto.lastname;
    if (dto.email !== undefined) userDto.email = dto.email;
    if (dto.documentnumber !== undefined)
      userDto.documentnumber = dto.documentnumber;
    if (dto.phone !== undefined) userDto.phone = dto.phone;
    if (dto.CV !== undefined) userDto.CV = dto.CV;

    if (dto.typeid !== undefined) userDto.typeid = dto.typeid;

    if (dto.techniciantypeids !== undefined) {
      userDto.techniciantypeids = dto.techniciantypeids;
    }
    if (dto.roleid !== undefined) {
      userDto.roleid = dto.roleid;
    }

    await this.usersService.update(technician.userid, userDto);

    return this.findOne(technicianId);
  }

  async remove(technicianId: number) {
    const technician = await this.techniciansRepo.findOne({
      where: { technicianid: technicianId },
    });

    if (!technician) {
      throw new NotFoundException('Técnico no encontrado');
    }

    await this.typeMapRepo.delete({ technicianid: technicianId });

    await this.usersService.remove(technician.userid);

    return { message: 'Técnico eliminado correctamente' };
  }
}
