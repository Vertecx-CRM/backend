// src/technicians/technicians.service.ts
import { Injectable } from '@nestjs/common';
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

  /**
   * Crear técnico = crear user con rol de técnico + registrar technician + technician_type_map.
   * Todo eso lo hace UsersService.create, nosotros solo adaptamos el DTO.
   */
  async create(dto: CreateTechnicianDto) {
    // ⚠️ Ajusta esto al id real del rol "Técnico" en tu tabla roleconfiguration
    const TECH_ROLE_CONFIGURATION_ID = dto.roleconfigurationid ?? 3;
    // ⚠️ Ajusta esto al stateid de "Activo" en tu tabla states
    const ACTIVE_STATE_ID = 1;
    // ⚠️ Ajusta esto al typeid del tipo de documento que estés usando (CC, etc.)
    const DEFAULT_DOCUMENT_TYPE_ID = 1;

    const userDto: CreateUserDto = {
      name: dto.name,
      lastname: dto.lastname,
      email: dto.email,
      documentnumber: dto.documentnumber,
      phone: dto.phone,
      typeid: DEFAULT_DOCUMENT_TYPE_ID,
      stateid: ACTIVE_STATE_ID,
      roleconfigurationid: TECH_ROLE_CONFIGURATION_ID,
      CV: dto.CV,
      techniciantypeids: dto.techniciantypeids,
    };
    return this.usersService.create(userDto);
  }

  async findAll() {

    return this.techniciansRepo.find({
      relations: ['users', 'technicianTypeMaps', 'technicianTypeMaps.techniciantype'],
    });
  }

  async findOne(id: number) {
    return this.techniciansRepo.findOne({
      where: { technicianid: id },
      relations: ['users', 'technicianTypeMaps', 'technicianTypeMaps.techniciantype'],
    });
  }

  async update(userId: number, dto: UpdateTechnicianDto) {
    const userDto: UpdateUserDto = {
      name: dto.name,
      lastname: dto.lastname,
      email: dto.email,
      documentnumber: dto.documentnumber,
      phone: dto.phone,
      CV: dto.CV,
      techniciantypeids: dto.techniciantypeids,
    };

    return this.usersService.update(userId, userDto);
  }

  async remove(technicianId: number) {
    // Ojo: aquí solo borras el técnico. Si quieres borrar también el usuario,
    // hay que definir primero la regla de negocio antes de tocarlo.
    await this.typeMapRepo.delete({ technicianid: technicianId });
    await this.techniciansRepo.delete(technicianId);
    return { message: 'Técnico eliminado correctamente' };
  }
}
