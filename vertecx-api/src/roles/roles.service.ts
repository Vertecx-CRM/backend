import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Roles } from './entities/roles.entity';
import { Roleconfiguration } from './entities/roleconfiguration.entity';
import { Permissions } from 'src/shared/entities/permissions.entity';
import { Privileges } from 'src/shared/entities/privileges.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleConfigurationDto } from './dto/update-role.dto';
import { UpdateRoleMatrixDto } from './dto/update-role-matrix.dto';

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

    private readonly dataSource: DataSource,
  ) {}

  private ensureNotAdmin(roleid: number) {
    if (roleid === 1) {
      throw new BadRequestException(
        'El rol ADMIN no puede ser modificado ni eliminado.',
      );
    }
  }

  private normalizeStatus(status?: string): string | undefined {
    if (status === undefined || status === null) return undefined;
    const v = String(status).toLowerCase().trim();
    if (['activo', 'active', '1', 'true'].includes(v)) return 'active';
    if (['inactivo', 'inactive', '0', 'false'].includes(v)) return 'inactive';
    return status;
  }

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


  async findAll() {
    const configurations = await this.rcRepo.find({
      relations: ['roles', 'permissions', 'privileges'],
      order: { roleconfigurationid: 'ASC' },
    });

    if (!configurations.length) {
      throw new NotFoundException('No hay configuraciones registradas.');
    }

    return configurations.map((rc) => ({
      roleconfigurationid: rc.roleconfigurationid,
      role: {
        id: rc.roles?.roleid ?? null,
        name: rc.roles?.name ?? null,
        status: rc.roles?.status ?? null,
      },
      permission: {
        id: rc.permissions?.permissionid ?? null,
        module: rc.permissions?.module ?? null,
      },
      privilege: {
        id: rc.privileges?.privilegeid ?? null,
        name: rc.privileges?.name ?? null,
      },
    }));
  }

  async findOne(id: number): Promise<Roles> {
    const role = await this.rolesRepo.findOne({
      where: { roleid: id },
      relations: ['roleconfigurations'],
    });
    if (!role) throw new NotFoundException('Rol no encontrado');
    return role;
  }

  async getRoleDetail(roleid: number) {
    const role = await this.rolesRepo.findOne({ where: { roleid } });
    if (!role) throw new NotFoundException('Rol no encontrado');

    const configs = await this.rcRepo.find({
      where: { roleid },
      relations: ['permissions', 'privileges'],
      order: { roleconfigurationid: 'ASC' },
    });

    return {
      role: {
        roleid: role.roleid,
        name: role.name,
        status: role.status,
      },
      configurations: configs.map((c) => ({
        roleconfigurationid: c.roleconfigurationid,
        permission: {
          id: c.permissionid,
          module: c.permissions?.module ?? null,
        },
        privilege: {
          id: c.privilegeid,
          name: c.privileges?.name ?? null,
        },
      })),
    };
  }

  async getRoleMatrix(roleid: number) {
    const role = await this.rolesRepo.findOne({ where: { roleid } });
    if (!role) throw new NotFoundException('Rol no encontrado');

    const [permissions, privileges, current] = await Promise.all([
      this.permissionsRepo.find({ order: { permissionid: 'ASC' } }),
      this.privilegesRepo.find({ order: { privilegeid: 'ASC' } }),
      this.rcRepo.find({
        where: { roleid },
        order: { roleconfigurationid: 'ASC' },
      }),
    ]);

    const currentSet = new Set(
      current.map((rc) => `${rc.permissionid}:${rc.privilegeid}`),
    );

    return {
      role,
      modules: permissions.map((perm) => ({
        permissionid: perm.permissionid,
        module: perm.module,
        privileges: privileges.map((priv) => ({
          privilegeid: priv.privilegeid,
          name: priv.name,
          checked: currentSet.has(
            `${perm.permissionid}:${priv.privilegeid}`,
          ),
        })),
        allSelected: privileges.every((priv) =>
          currentSet.has(`${perm.permissionid}:${priv.privilegeid}`),
        ),
      })),
    };
  }

  async updateConfigurations(dto: UpdateRoleConfigurationDto) {
    if (dto.role?.roleid === 1) {
      throw new BadRequestException('El rol ADMIN no puede ser editado.');
    }

    const updatedConfigs = [];

    if (dto.role) {
      const role = await this.rolesRepo.findOne({
        where: { roleid: dto.role.roleid },
      });

      if (!role) {
        throw new BadRequestException(
          `El rol con ID ${dto.role.roleid} no existe`,
        );
      }

      if (dto.role.name && dto.role.name !== role.name) {
        await this.ensureUniqueRoleName(dto.role.name, role.roleid);
        role.name = dto.role.name;
      }

      if (dto.role.status !== undefined) {
        const normalized = this.normalizeStatus(dto.role.status);
        if (normalized) {
          role.status = normalized;
        }
      }

      await this.rolesRepo.save(role);
    }

    for (const item of dto.configurations) {
      const current = await this.rcRepo.findOne({
        where: { roleconfigurationid: item.roleconfigurationid },
      });

      if (!current) {
        throw new NotFoundException(
          `La configuración ${item.roleconfigurationid} no existe`,
        );
      }

      if (current.roleid === 1) {
        throw new BadRequestException(
          'Las configuraciones del rol ADMIN no pueden modificarse.',
        );
      }

      const next = {
        roleid: item.roleid ?? current.roleid,
        permissionid: item.permissionid ?? current.permissionid,
        privilegeid: item.privilegeid ?? current.privilegeid,
      };

      const dup = await this.rcRepo.findOne({
        where: next,
      });

      if (dup && dup.roleconfigurationid !== current.roleconfigurationid) {
        throw new BadRequestException(
          'Ya existe otra configuración con estos valores.',
        );
      }

      const merged = this.rcRepo.merge(current, next);
      updatedConfigs.push(await this.rcRepo.save(merged));
    }

    return updatedConfigs;
  }

  async replaceRoleMatrix(roleid: number, dto: UpdateRoleMatrixDto) {
    this.ensureNotAdmin(roleid);

    const role = await this.rolesRepo.findOne({ where: { roleid } });
    if (!role) throw new NotFoundException('Rol no encontrado');

    if (!dto.items || dto.items.length === 0) {
      return this.getRoleMatrix(roleid);
    }

    const permIds = dto.items.map((i) => i.permissionid);

    const perms = await this.permissionsRepo
      .createQueryBuilder('p')
      .where('p.permissionid IN (:...ids)', { ids: permIds })
      .getMany();

    if (perms.length !== new Set(permIds).size) {
      throw new BadRequestException('Algún permissionid no existe');
    }

    const allPrivIds = [...new Set(dto.items.flatMap((i) => i.privilegeids))];

    if (allPrivIds.length > 0) {
      const privs = await this.privilegesRepo
        .createQueryBuilder('v')
        .where('v.privilegeid IN (:...ids)', { ids: allPrivIds })
        .getMany();

      if (privs.length !== allPrivIds.length) {
        throw new BadRequestException('Algún privilegeid no existe');
      }
    }

    const desiredTuples = new Set<string>();

    dto.items.forEach((i) => {
      (i.privilegeids || []).forEach((privId) => {
        desiredTuples.add(`${roleid}:${i.permissionid}:${privId}`);
      });
    });

    const current = await this.rcRepo.find({ where: { roleid } });

    const currentTuples = new Set(
      current.map(
        (rc) => `${rc.roleid}:${rc.permissionid}:${rc.privilegeid}`,
      ),
    );

    const toDelete = current.filter(
      (rc) =>
        !desiredTuples.has(`${rc.roleid}:${rc.permissionid}:${rc.privilegeid}`),
    );

    const toInsertTuples: {
      roleid: number;
      permissionid: number;
      privilegeid: number;
    }[] = [];

    desiredTuples.forEach((key) => {
      if (!currentTuples.has(key)) {
        const [, permId, privId] = key.split(':').map(Number);
        toInsertTuples.push({
          roleid,
          permissionid: permId,
          privilegeid: privId,
        });
      }
    });

    await this.dataSource.transaction(async (manager) => {
      if (toDelete.length) {
        await manager.delete(
          Roleconfiguration,
          toDelete.map((x) => x.roleconfigurationid),
        );
      }

      if (toInsertTuples.length) {
        const rows = toInsertTuples.map((t) =>
          manager.create(Roleconfiguration, t),
        );
        await manager.save(Roleconfiguration, rows);
      }
    });

    return this.getRoleMatrix(roleid);
  }

  async remove(id: number): Promise<void> {
    this.ensureNotAdmin(id);

    const role = await this.rolesRepo.findOne({ where: { roleid: id } });
    if (!role) throw new NotFoundException('Rol no encontrado');

    const configs = await this.rcRepo.find({
      where: { roleid: id },
      relations: ['users'],
    });

    const hasUsers = configs.some((c) => (c.users?.length ?? 0) > 0);

    if (hasUsers) {
      throw new BadRequestException(
        'No se puede eliminar el rol porque tiene usuarios asociados.',
      );
    }

    if (configs.length > 0) {
      await this.rcRepo.remove(configs);
    }

    await this.rolesRepo.remove(role);
  }
}
