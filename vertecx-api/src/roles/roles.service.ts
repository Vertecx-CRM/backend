import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
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
  ) { }

  private readonly MODULE_PRIVILEGES: Record<string, string[]> = {
    appointments: ['update', 'read', 'deactivate'],
    sales: ['create', 'read', 'deactivate'],
    purchaseOrders: ['read', 'deactivate'],
    orderServices: [
      'create',
      'update',
      'read',
      'deactivate',
      'add_history',
      'report_warranty',
      'download_report',
    ],
    servicesRequest: ['create', 'update', 'read', 'deactivate'],
  };

  private readonly DEFAULT_PRIVILEGES = ['create', 'read', 'update', 'delete'];

  private normalizeStatus(status?: string): string | undefined {
    if (status === undefined || status === null) return undefined;
    const v = String(status).toLowerCase().trim();
    if (['activo', 'active', '1', 'true'].includes(v)) return 'active';
    if (['inactivo', 'inactive', '0', 'false'].includes(v)) return 'inactive';
    return status;
  }

  private getAllowedPrivilegeNamesForModule(moduleKey: string): string[] {
    return this.MODULE_PRIVILEGES[moduleKey] ?? this.DEFAULT_PRIVILEGES;
  }

  private async ensureUniqueRoleName(name: string, excludeId?: number) {
    const qb = this.rolesRepo
      .createQueryBuilder('r')
      .where('LOWER(r.name) = LOWER(:name)', { name });

    if (excludeId) qb.andWhere('r.roleid <> :id', { id: excludeId });

    const exists = await qb.getExists();
    if (exists) throw new BadRequestException('El nombre del rol ya existe.');
  }

  private dedupeConfigs(configs: { permissionid: number; privilegeid: number }[]) {
    const seen = new Set<string>();
    const out: { permissionid: number; privilegeid: number }[] = [];

    for (const c of configs || []) {
      const key = `${c.permissionid}:${c.privilegeid}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(c);
    }
    return out;
  }

  private async ensurePermissionsAndPrivilegesBulk(
    configs: { permissionid: number; privilegeid: number }[],
  ) {
    const deduped = this.dedupeConfigs(configs);

    const permIds = [...new Set(deduped.map((c) => c.permissionid))];
    const privIds = [...new Set(deduped.map((c) => c.privilegeid))];

    const [perms, privs] = await Promise.all([
      this.permissionsRepo.find({ where: { permissionid: In(permIds) } }),
      this.privilegesRepo.find({ where: { privilegeid: In(privIds) } }),
    ]);

    const permById = new Map<number, Permissions>();
    perms.forEach((p) => permById.set(p.permissionid, p));

    const privById = new Map<number, Privileges>();
    privs.forEach((v) => privById.set(v.privilegeid, v));

    if (permById.size !== permIds.length) {
      throw new BadRequestException('Algún permissionid no existe');
    }
    if (privById.size !== privIds.length) {
      throw new BadRequestException('Algún privilegeid no existe');
    }

    for (const c of deduped) {
      const perm = permById.get(c.permissionid)!;
      const priv = privById.get(c.privilegeid)!;

      const allowed = this.getAllowedPrivilegeNamesForModule(String(perm.module)).map((x) =>
        String(x).toLowerCase(),
      );

      const privName = String(priv.name).toLowerCase();
      if (!allowed.includes(privName)) {
        throw new BadRequestException(
          `El privilegio "${priv.name}" no está permitido para el módulo "${perm.module}".`,
        );
      }
    }

    return { deduped, permById, privById };
  }

  async create(dto: CreateRoleDto): Promise<Roles> {
    await this.ensureUniqueRoleName(dto.name);

    const { deduped } = await this.ensurePermissionsAndPrivilegesBulk(dto.roleconfigurations);

    const role = this.rolesRepo.create({
      name: dto.name,
      status: typeof dto.status === 'string' ? this.normalizeStatus(dto.status) ?? dto.status : 'active',
    });

    return await this.dataSource.transaction(async (manager) => {
      const savedRole = await manager.save(Roles, role);

      // bulk insert (deduped)
      const rows = deduped.map((c) =>
        manager.create(Roleconfiguration, {
          roleid: savedRole.roleid,
          permissionid: c.permissionid,
          privilegeid: c.privilegeid,
        }),
      );

      if (rows.length) {
        await manager.save(Roleconfiguration, rows);
      }

      return savedRole;
    });
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

  async listRoles() {
    const roles = await this.rolesRepo.find({
      order: { roleid: 'ASC' },
    });

    return { success: true, data: roles };
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
    const rows = await this.rcRepo
      .createQueryBuilder('rc')
      .leftJoin(Roles, 'r', 'r.roleid = rc.roleid')
      .leftJoin(Permissions, 'p', 'p.permissionid = rc.permissionid')
      .leftJoin(Privileges, 'v', 'v.privilegeid = rc.privilegeid')
      .where('rc.roleid = :roleid', { roleid })
      .select([
        'rc.roleconfigurationid AS rc_roleconfigurationid',
        'r.roleid AS r_roleid',
        'r.name AS r_name',
        'r.status AS r_status',
        'p.permissionid AS p_permissionid',
        'p.module AS p_module',
        'v.privilegeid AS v_privilegeid',
        'v.name AS v_name',
      ])
      .orderBy('rc.roleconfigurationid', 'ASC')
      .getRawMany();

    // Si un rol puede existir sin configs, entonces debes consultar roles
    // PERO en tu sistema siempre debe tener al menos 1 config, así que esto está OK.
    if (!rows.length) {
      const role = await this.rolesRepo.findOne({ where: { roleid } });
      if (!role) throw new NotFoundException('Rol no encontrado');
      return { role, configurations: [] };
    }

    return {
      role: {
        roleid: Number(rows[0].r_roleid),
        name: rows[0].r_name,
        status: rows[0].r_status,
      },
      configurations: rows.map((row) => ({
        roleconfigurationid: Number(row.rc_roleconfigurationid),
        permission: {
          id: Number(row.p_permissionid),
          module: row.p_module,
        },
        privilege: {
          id: Number(row.v_privilegeid),
          name: row.v_name,
        },
      })),
    };
  }

  async getRoleMatrix(roleid: number) {
    const role = await this.rolesRepo.findOne({ where: { roleid } });
    if (!role) throw new NotFoundException('Rol no encontrado');

    const [permissions, allPrivileges, current] = await Promise.all([
      this.permissionsRepo.find({ order: { permissionid: 'ASC' } }),
      this.privilegesRepo.find({ order: { privilegeid: 'ASC' } }),
      this.rcRepo.find({
        where: { roleid },
        order: { roleconfigurationid: 'ASC' },
      }),
    ]);

    const currentSet = new Set(current.map((rc) => `${rc.permissionid}:${rc.privilegeid}`));

    const privByName = new Map<string, Privileges>();
    allPrivileges.forEach((p) => privByName.set(String(p.name).toLowerCase(), p));

    return {
      role,
      modules: permissions.map((perm) => {
        const allowedNames = this.getAllowedPrivilegeNamesForModule(String(perm.module));

        const allowedPrivs = allowedNames
          .map((n) => privByName.get(String(n).toLowerCase()))
          .filter(Boolean) as Privileges[];

        return {
          permissionid: perm.permissionid,
          module: perm.module,
          privileges: allowedPrivs.map((priv) => ({
            privilegeid: priv.privilegeid,
            name: priv.name,
            checked: currentSet.has(`${perm.permissionid}:${priv.privilegeid}`),
          })),
          allSelected: allowedPrivs.length
            ? allowedPrivs.every((priv) => currentSet.has(`${perm.permissionid}:${priv.privilegeid}`))
            : false,
        };
      }),
    };
  }

  async updateConfigurations(dto: UpdateRoleConfigurationDto) {
    const updatedConfigs = [];
    const configs = Array.isArray(dto.configurations) ? dto.configurations : [];

    if (!dto.role && configs.length === 0) {
      throw new BadRequestException('Debe enviar cambios en el rol o en las configuraciones.');
    }

    if (dto.role) {
      const role = await this.rolesRepo.findOne({
        where: { roleid: dto.role.roleid },
      });

      if (!role) {
        throw new BadRequestException(`El rol con ID ${dto.role.roleid} no existe`);
      }

      if (dto.role.name && dto.role.name !== role.name) {
        await this.ensureUniqueRoleName(dto.role.name, role.roleid);
        role.name = dto.role.name;
      }

      if (dto.role.status !== undefined) {
        const normalized = this.normalizeStatus(dto.role.status);
        if (normalized) role.status = normalized;
      }

      await this.rolesRepo.save(role);
    }

    for (const item of configs) {
      const current = await this.rcRepo.findOne({
        where: { roleconfigurationid: item.roleconfigurationid },
      });

      if (!current) {
        throw new NotFoundException(`La configuración ${item.roleconfigurationid} no existe`);
      }

      const next = {
        roleid: item.roleid ?? current.roleid,
        permissionid: item.permissionid ?? current.permissionid,
        privilegeid: item.privilegeid ?? current.privilegeid,
      };

      // Validación si cambian campos (bulk sería overkill aquí)
      if (next.permissionid !== current.permissionid || next.privilegeid !== current.privilegeid) {
        await this.ensurePermissionsAndPrivilegesBulk([{ permissionid: next.permissionid, privilegeid: next.privilegeid }]);
      }

      const dup = await this.rcRepo.findOne({
        where: next,
      });

      if (dup && dup.roleconfigurationid !== current.roleconfigurationid) {
        throw new BadRequestException('Ya existe otra configuración con estos valores.');
      }

      const merged = this.rcRepo.merge(current, next);
      updatedConfigs.push(await this.rcRepo.save(merged));
    }

    return updatedConfigs;
  }

  async replaceRoleMatrix(roleid: number, dto: UpdateRoleMatrixDto) {
    const role = await this.rolesRepo.findOne({ where: { roleid } });
    if (!role) throw new NotFoundException('Rol no encontrado');

    if (!dto.items || dto.items.length === 0) {
      return this.getRoleMatrix(roleid);
    }

    const flatConfigs: { permissionid: number; privilegeid: number }[] = [];
    for (const it of dto.items) {
      for (const pid of it.privilegeids || []) {
        flatConfigs.push({ permissionid: it.permissionid, privilegeid: pid });
      }
    }

    const { deduped } = await this.ensurePermissionsAndPrivilegesBulk(flatConfigs);

    const desiredTuples = new Set<string>(
      deduped.map((c) => `${roleid}:${c.permissionid}:${c.privilegeid}`),
    );

    const current = await this.rcRepo.find({ where: { roleid } });

    const currentTuples = new Set(
      current.map((rc) => `${rc.roleid}:${rc.permissionid}:${rc.privilegeid}`),
    );

    const toDeleteIds = current
      .filter((rc) => !desiredTuples.has(`${rc.roleid}:${rc.permissionid}:${rc.privilegeid}`))
      .map((x) => x.roleconfigurationid);

    const toInsert: { roleid: number; permissionid: number; privilegeid: number }[] = [];
    for (const key of desiredTuples) {
      if (!currentTuples.has(key)) {
        const [, permId, privId] = key.split(':').map(Number);
        toInsert.push({ roleid, permissionid: permId, privilegeid: privId });
      }
    }

    await this.dataSource.transaction(async (manager) => {
      if (toDeleteIds.length) {
        await manager.delete(Roleconfiguration, toDeleteIds);
      }
      if (toInsert.length) {
        const rows = toInsert.map((t) => manager.create(Roleconfiguration, t));
        await manager.save(Roleconfiguration, rows);
      }
    });

    return this.getRoleMatrix(roleid);
  }

  async remove(id: number): Promise<void> {
    const role = await this.rolesRepo.findOne({ where: { roleid: id } });
    if (!role) throw new NotFoundException('Rol no encontrado');

    const [{ count }] = await this.dataSource.query(
      'SELECT COUNT(*)::int AS count FROM users WHERE roleid = $1',
      [id],
    );

    if (Number(count ?? 0) > 0) {
      throw new BadRequestException('No se puede eliminar el rol porque tiene usuarios asociados.');
    }

    await this.dataSource
      .createQueryBuilder()
      .delete()
      .from(Roleconfiguration)
      .where('roleid = :roleid', { roleid: id })
      .execute();

    await this.rolesRepo.remove(role);
  }
}