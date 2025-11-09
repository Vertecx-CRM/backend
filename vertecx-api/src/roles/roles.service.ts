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

  private normalizeStatus(input?: string | boolean): 'active' | 'inactive' {
    if (typeof input === 'boolean') return input ? 'active' : 'inactive';
    const s = String(input ?? 'active')
      .toLowerCase()
      .trim();
    if (s === 'activo' || s === 'active' || s === '1' || s === 'true')
      return 'active';
    if (s === 'inactivo' || s === 'inactive' || s === '0' || s === 'false')
      return 'inactive';
    return 'active';
  }

  async create(dto: CreateRoleDto): Promise<Roles> {
    await this.ensureUniqueRoleName(dto.name);
    await this.ensurePermissionsAndPrivileges(dto.roleconfigurations);

    const role = this.rolesRepo.create({
      name: dto.name,
      status: this.normalizeStatus(dto.status),
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
      throw new NotFoundException(
        'No hay configuraciones de roles registradas.',
      );
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
    const role = await this.rolesRepo.findOne({ where: { roleid: id } });
    if (!role) throw new NotFoundException('Rol no encontrado');
    return role;
  }

  async findOneDetail(roleid: number) {
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
      configurations: configs.map((rc) => ({
        roleconfigurationid: rc.roleconfigurationid,
        permission: {
          id: rc.permissionid,
          module: rc.permissions?.module ?? null,
        },
        privilege: {
          id: rc.privilegeid,
          name: rc.privileges?.name ?? null,
        },
      })),
    };
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

  async updateConfigurations(dto: UpdateRoleConfigurationDto) {
    return this.dataSource.transaction(async (manager) => {
      let patchedRole: Roles | undefined;
      if (dto.role) {
        const role = await manager.findOne(Roles, {
          where: { roleid: dto.role.roleid },
        });
        if (!role) throw new NotFoundException('Rol no encontrado');

        if (dto.role.name) {
          const exists = await manager
            .createQueryBuilder(Roles, 'r')
            .where('LOWER(r.name) = LOWER(:name)', { name: dto.role.name })
            .andWhere('r.roleid <> :id', { id: role.roleid })
            .getExists();
          if (exists)
            throw new BadRequestException('El nombre del rol ya existe');
          role.name = dto.role.name;
        }
        if (dto.role.status !== undefined) {
          role.status = this.normalizeStatus(dto.role.status);
        }
        patchedRole = await manager.save(Roles, role);
      }

      const items = dto.configurations ?? [];
      const updatedConfigs: Roleconfiguration[] = [];

      for (const item of items) {
        const current = await manager.findOne(Roleconfiguration, {
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
          const role = await manager.findOne(Roles, {
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
          const perm = await manager.findOne(Permissions, {
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
          const priv = await manager.findOne(Privileges, {
            where: { privilegeid: next.privilegeid },
          });
          if (!priv) {
            throw new BadRequestException(
              `El privilegio con ID ${next.privilegeid} no existe`,
            );
          }
        }

        const dup = await manager.findOne(Roleconfiguration, {
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

        const merged = manager.merge(Roleconfiguration, current, next);
        const saved = await manager.save(Roleconfiguration, merged);
        updatedConfigs.push(saved);
      }

      return {
        role: patchedRole
          ? {
              roleid: patchedRole.roleid,
              name: patchedRole.name,
              status: patchedRole.status,
            }
          : null,
        configurations: updatedConfigs,
      };
    });
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
      role: { roleid: role.roleid, name: role.name, status: role.status },
      modules: permissions.map((perm) => ({
        permissionid: perm.permissionid,
        module: perm.module,
        privileges: privileges.map((priv) => ({
          privilegeid: priv.privilegeid,
          name: priv.name,
          checked: currentSet.has(`${perm.permissionid}:${priv.privilegeid}`),
        })),
        allSelected: privileges.every((priv) =>
          currentSet.has(`${perm.permissionid}:${priv.privilegeid}`),
        ),
      })),
    };
  }

  async replaceRoleMatrix(roleid: number, dto: UpdateRoleMatrixDto) {
    const role = await this.rolesRepo.findOne({ where: { roleid } });
    if (!role) throw new NotFoundException('Rol no encontrado');

    if (
      !dto.items?.length ||
      dto.items.every((i) => !i.privilegeids || i.privilegeids.length === 0)
    ) {
      throw new BadRequestException(
        'Debe asignar al menos un permiso/privilegio al rol.',
      );
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
      current.map((rc) => `${rc.roleid}:${rc.permissionid}:${rc.privilegeid}`),
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

  async remove(roleid: number): Promise<void> {
    const role = await this.rolesRepo.findOne({ where: { roleid } });
    if (!role) throw new NotFoundException('Rol no encontrado');

    await this.dataSource.transaction(async (manager) => {
      const cfgs = await manager.find(Roleconfiguration, { where: { roleid } });
      if (cfgs.length) {
        await manager.delete(
          Roleconfiguration,
          cfgs.map((c) => c.roleconfigurationid),
        );
      }
      await manager.delete(Roles, { roleid });
    });
  }
}
