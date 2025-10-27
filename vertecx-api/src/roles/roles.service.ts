import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Roles } from './entities/roles.entity';
import { Roleconfiguration } from './entities/roleconfiguration.entity';
import { Permissions } from 'src/shared/entities/permissions.entity';
import { Privileges } from 'src/shared/entities/privileges.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleConfigurationDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Roles)
    private readonly rolesRepo: Repository<Roles>,

    @InjectRepository(Roleconfiguration)
    private readonly rcRepo: Repository<Roleconfiguration>,

    @InjectRepository(Permissions)
    private readonly permissionsRepo: Repository<Permissions>,

    @InjectRepository(Privileges)
    private readonly privilegesRepo: Repository<Privileges>,
  ) {}

  private async ensurePermissionsAndPrivileges(
    configurations: { permissionid: number; privilegeid: number }[],
  ) {
    for (const config of configurations) {
      const permission = await this.permissionsRepo.findOne({
        where: { permissionid: config.permissionid },
      });
      if (!permission) {
        throw new BadRequestException(
          `El permiso con ID ${config.permissionid} no existe`,
        );
      }

      const privilege = await this.privilegesRepo.findOne({
        where: { privilegeid: config.privilegeid },
      });
      if (!privilege) {
        throw new BadRequestException(
          `El privilegio con ID ${config.privilegeid} no existe`,
        );
      }
    }
  }

  private async ensureUniqueRoleName(name: string, excludeId?: number) {
    const qb = this.rolesRepo
      .createQueryBuilder('r')
      .where('LOWER(r.name) = LOWER(:name)', { name });

    if (excludeId) qb.andWhere('r.roleid <> :id', { id: excludeId });

    const exists = await qb.getExists();
    if (exists) throw new BadRequestException('El nombre del rol ya existe.');
  }

  async create(dto: CreateRoleDto): Promise<Roles> {
    await this.ensureUniqueRoleName(dto.name);
    await this.ensurePermissionsAndPrivileges(dto.roleconfigurations);

    const role = this.rolesRepo.create({
      name: dto.name,
      status: typeof dto.status === 'string' ? dto.status : 'active',
    });
    const savedRole = await this.rolesRepo.save(role);

    const roleConfigs = dto.roleconfigurations.map((c) =>
      this.rcRepo.create({
        roleid: savedRole.roleid,
        permissionid: c.permissionid,
        privilegeid: c.privilegeid,
      }),
    );
    await this.rcRepo.save(roleConfigs);

    return savedRole;
  }

  async findAll(): Promise<Roles[]> {
    return this.rolesRepo.find({ relations: ['roleconfigurations'] });
  }

  async findOne(id: number): Promise<Roles> {
    const role = await this.rolesRepo.findOne({
      where: { roleid: id },
      relations: ['roleconfigurations'],
    });
    if (!role) throw new NotFoundException('Rol no encontrado');
    return role;
  }

  async updateConfigurations(dto: UpdateRoleConfigurationDto) {
    const updatedConfigs = [];

    for (const item of dto.configurations) {
      const current = await this.rcRepo.findOne({
        where: { roleconfigurationid: item.roleconfigurationid },
      });
      if (!current) {
        throw new NotFoundException(
          `La configuración con ID ${item.roleconfigurationid} no existe`,
        );
      }

      const next = {
        roleid: item.roleid ?? current.roleid,
        permissionid: item.permissionid ?? current.permissionid,
        privilegeid: item.privilegeid ?? current.privilegeid,
      };

      if (item.roleid !== undefined && item.roleid !== current.roleid) {
        const role = await this.rolesRepo.findOne({
          where: { roleid: next.roleid },
        });
        if (!role)
          throw new BadRequestException(
            `El rol con ID ${next.roleid} no existe`,
          );
      }

      if (
        item.permissionid !== undefined &&
        item.permissionid !== current.permissionid
      ) {
        const perm = await this.permissionsRepo.findOne({
          where: { permissionid: next.permissionid },
        });
        if (!perm) {
          throw new BadRequestException(
            `El permiso con ID ${next.permissionid} no existe`,
          );
        }
      }

      if (
        item.privilegeid !== undefined &&
        item.privilegeid !== current.privilegeid
      ) {
        const priv = await this.privilegesRepo.findOne({
          where: { privilegeid: next.privilegeid },
        });
        if (!priv) {
          throw new BadRequestException(
            `El privilegio con ID ${next.privilegeid} no existe`,
          );
        }
      }

      const dup = await this.rcRepo.findOne({
        where: {
          roleid: next.roleid,
          permissionid: next.permissionid,
          privilegeid: next.privilegeid,
        },
      });
      if (dup && dup.roleconfigurationid !== current.roleconfigurationid) {
        throw new BadRequestException(
          'Ya existe una configuración con ese roleid/permissionid/privilegeid',
        );
      }

      const merged = this.rcRepo.merge(current, next);
      const saved = await this.rcRepo.save(merged);
      updatedConfigs.push(saved);
    }

    return updatedConfigs;
  }
  async remove(id: number): Promise<void> {
    const role = await this.findOne(id);
    await this.rolesRepo.remove(role);
  }
}
