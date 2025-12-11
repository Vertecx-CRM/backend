import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, Not, Repository } from 'typeorm';

import { Users } from './entities/users.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

// ENTIDADES
import { Typeofdocuments } from 'src/shared/entities/typeofdocuments.entity';
import { States } from 'src/shared/entities/states.entity';
import { Roles } from 'src/roles/entities/roles.entity';
import { Technicians } from 'src/technicians/entities/technicians.entity';
import { Customers } from 'src/customers/entities/customers.entity';
import { TechnicianTypeMap } from 'src/shared/entities/technician-type-map.entity';
import { Techniciantypes } from 'src/technicians/entities/technician_types.entity';

// MAIL
import { MailService } from 'src/shared/mail/mail.service';
import * as bcrypt from 'bcrypt';
import { generateRandomPassword } from 'src/shared/utils/generate-password';

// HELPERS
import { ensureDocumentType } from './helpers/ensure-document-type.helper';
import { ensureState } from './helpers/ensure-state.helper';
import { resolveRoleCreate } from './helpers/resolve-role.helper';
import { ensureNoDuplicatesOnUpdate } from './helpers/duplicates-update.helper';
import { hasUserLinkedRecords } from './helpers/linked-records.helper';
import { cleanupTechnician } from './helpers/cleanup-technician.helper';
import { cleanupCustomer } from './helpers/cleanup-customer.helper';
import { buildUpdateNotificationHTML } from './helpers/build-update-html.helper';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private usersRepo: Repository<Users>,

    @InjectRepository(Typeofdocuments)
    private docRepo: Repository<Typeofdocuments>,

    @InjectRepository(States)
    private stateRepo: Repository<States>,

    @InjectRepository(Roles)
    private rolesRepo: Repository<Roles>,

    @InjectRepository(Technicians)
    private techRepo: Repository<Technicians>,

    @InjectRepository(Customers)
    private customerRepo: Repository<Customers>,

    @InjectRepository(TechnicianTypeMap)
    private techMapRepo: Repository<TechnicianTypeMap>,

    @InjectRepository(Techniciantypes)
    private techTypeRepo: Repository<Techniciantypes>,

    private mailService: MailService,
    private dataSource: DataSource,
  ) { }

  // UTILIDADES BÁSICAS

  private normalizeRoleName(name: string): string {
    return (name ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  async getRoleIdByName(name: string): Promise<number> {
    const role = await this.rolesRepo
      .createQueryBuilder('r')
      .where('LOWER(r.name) = LOWER(:name)', { name })
      .getOne();

    if (!role) throw new BadRequestException(`No existe el rol "${name}"`);
    return role.roleid;
  }

  async getRoleById(id: number) {
    const role = await this.rolesRepo.findOne({ where: { roleid: id } });
    if (!role) throw new BadRequestException('Rol inválido.');
    return role;
  }

  async getRoleNameByRoleId(id: number) {
    return this.normalizeRoleName((await this.getRoleById(id)).name);
  }

  // CREATE
  async create(dto: CreateUserDto) {
    return await this.dataSource.transaction(async manager => {
      // Validación de duplicados
      const exists = await manager.getRepository(Users).findOne({
        where: [
          { documentnumber: dto.documentnumber },
          { email: dto.email },
          { phone: dto.phone },
        ],
      });
      if (exists) {
        throw new BadRequestException(
          'Ya existe un usuario con ese documento, correo o teléfono.',
        );
      }

      // Tipo documento y estado
      const { docType, isNit } = await ensureDocumentType(manager, dto.typeid);
      const state = await ensureState(manager, dto.stateid);

      // Rol asignado
      const resolvedRole = await resolveRoleCreate(
        manager,
        dto,
        isNit,
        this,
      );

      // Construcción de payload seguro
      const plainPassword = generateRandomPassword(10);
      const hashed = await bcrypt.hash(plainPassword, 10);

      const payload = {
        name: dto.name,
        lastname: isNit ? null : dto.lastname,
        documentnumber: dto.documentnumber,
        email: dto.email,
        phone: dto.phone,
        isNit,
        password: hashed,
        mustchangepassword: true,
        typeid: docType.typeofdocumentid,
        stateid: state.stateid,
        roleid: resolvedRole.roleid,
        createat: new Date(),
        updateat: null,
      };

      // Crear usuario
      const saved = await manager.getRepository(Users).save(
        manager.getRepository(Users).create(payload),
      );

      const roleName = this.normalizeRoleName(resolvedRole.name);

      // Crear registros secundarios
      if (roleName === 'tecnico') {
        const savedTech = await manager.getRepository(Technicians).save(
          manager.getRepository(Technicians).create({
            userid: saved.userid,
            CV: dto.CV ?? '',
          }),
        );

        if (dto.techniciantypeids?.length) {
          const validTypes = await manager.getRepository(Techniciantypes).find({
            where: { techniciantypeid: In(dto.techniciantypeids) },
          });

          if (validTypes.length !== dto.techniciantypeids.length) {
            throw new BadRequestException(
              'Uno o más tipos de técnico no son válidos.',
            );
          }

          const mappings = dto.techniciantypeids.map(typeId =>
            manager.getRepository(TechnicianTypeMap).create({
              technicianid: savedTech.technicianid,
              techniciantypeid: typeId,
            }),
          );

          await manager.getRepository(TechnicianTypeMap).save(mappings);
        }
      }

      if (roleName === 'cliente') {
        await manager.getRepository(Customers).save(
          manager.getRepository(Customers).create({
            userid: saved.userid,
            customercity: dto.customercity ?? null,
            customerzipcode: dto.customerzipcode ?? null,
          }),
        );
      }

      // Enviar correo — no bloqueante
      void this.mailService
        .sendUserPassword(saved.email, saved.name, plainPassword)
        .catch(() => { });

      return {
        success: true,
        message: 'Usuario creado correctamente y contraseña enviada.',
        data: { ...saved, password: undefined },
      };
    });
  }


  // UPDATE
  async update(id: number, dto: UpdateUserDto) {
    return await this.dataSource.transaction(async manager => {
      const repo = manager.getRepository(Users);

      const user = await repo.findOne({ where: { userid: id } });
      if (!user) {
        throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
      }

      // Validaciones
      await ensureNoDuplicatesOnUpdate(id, dto, manager);
      const docValidation = await ensureDocumentType(manager, dto.typeid ?? user.typeid);
      const stateValidation = dto.stateid
        ? await ensureState(manager, dto.stateid)
        : null;

      const isNit = docValidation.isNit;
      const resolvedRoleId =
        dto.roleid ??
        (isNit ? await this.getRoleIdByName('cliente') : user.roleid);

      await this.getRoleById(resolvedRoleId);

      // Cambio de email: generar nueva clave
      let plainPassword: string | null = null;
      let hashed: string | undefined = undefined;

      const emailChanged = dto.email && dto.email !== user.email;

      if (emailChanged) {
        plainPassword = generateRandomPassword(10);
        hashed = await bcrypt.hash(plainPassword, 10);
      }

      // Construcción de payload seguro
      const payload = {
        ...user,
        ...dto,
        typeid: docValidation.docType.typeofdocumentid,
        isNit,
        lastname: isNit ? null : dto.lastname ?? user.lastname,
        roleid: resolvedRoleId,
        password: emailChanged ? hashed : user.password,
        mustchangepassword: emailChanged ? true : user.mustchangepassword,
        updateat: new Date(),
      };

      // Guardar usuario
      const savedUser = await repo.save(payload);

      // Manejo de roles secundarios
      const roleName = await this.getRoleNameByRoleId(resolvedRoleId);

      await this.applyRoleDependenciesOnUpdate({
        userId: id,
        roleName,
        dto,
        manager,
        isNit,
      });

      // Notificación por correo
      const htmlChanges = buildUpdateNotificationHTML(dto);

      if (!emailChanged) {
        void this.mailService
          .sendUpdateNotification(savedUser.email, savedUser.name, htmlChanges)
          .catch(() => { });
      }

      if (emailChanged && plainPassword) {
        void this.mailService
          .sendUserPassword(savedUser.email, savedUser.name, plainPassword)
          .catch(() => { });
      }

      // Devolver usuario refrescado
      const refreshedUser = await repo
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.states', 'state')
        .leftJoinAndSelect('user.typeofdocuments', 'docType')
        .leftJoinAndSelect('user.roles', 'role')
        .leftJoinAndSelect('user.technicians', 'tech')
        .leftJoinAndSelect('tech.technicianTypeMaps', 'typeMap')
        .leftJoinAndSelect('typeMap.techniciantype', 'techType')
        .leftJoinAndSelect('user.customers', 'cust')
        .where('user.userid = :id', { id })
        .getOne();

      return {
        success: true,
        message: emailChanged
          ? 'Usuario actualizado y se envió nueva contraseña.'
          : 'Usuario actualizado correctamente.',
        data: refreshedUser ?? savedUser,
      };
    });
  }

  // Lógica auxiliar para roles en update
  private async applyRoleDependenciesOnUpdate({
    userId,
    roleName,
    dto,
    manager,
    isNit,
  }: any) {
    const techRepo = manager.getRepository(Technicians);
    const custRepo = manager.getRepository(Customers);
    const mapRepo = manager.getRepository(TechnicianTypeMap);
    const typeRepo = manager.getRepository(Techniciantypes);

    const existingTech = await techRepo.findOne({ where: { userid: userId } });
    const existingCust = await custRepo.findOne({ where: { userid: userId } });

    // TECNICO
    if (roleName === 'tecnico') {
      if (existingCust) await custRepo.remove(existingCust);

      let savedTech: Technicians;

      if (existingTech) {
        existingTech.CV = dto.CV ?? existingTech.CV;
        savedTech = await techRepo.save(existingTech);
      } else {
        savedTech = await techRepo.save(
          techRepo.create({ userid: userId, CV: dto.CV ?? '' }),
        );
      }

      if (dto.techniciantypeids) {
        await mapRepo.delete({ technicianid: savedTech.technicianid });

        if (dto.techniciantypeids.length) {
          const valid = await typeRepo.find({
            where: { techniciantypeid: In(dto.techniciantypeids) },
          });

          if (valid.length !== dto.techniciantypeids.length) {
            throw new BadRequestException(
              'Uno o más tipos de técnico no son válidos.',
            );
          }

          const mappings = dto.techniciantypeids.map(tid =>
            mapRepo.create({
              technicianid: savedTech.technicianid,
              techniciantypeid: tid,
            }),
          );

          await mapRepo.save(mappings);
        }
      }
    }

    // CLIENTE / NIT
    else if (roleName === 'cliente' || isNit) {
      if (existingTech) await techRepo.remove(existingTech);

      if (existingCust) {
        existingCust.customercity =
          dto.customercity ?? existingCust.customercity;
        existingCust.customerzipcode =
          dto.customerzipcode ?? existingCust.customerzipcode;
        await custRepo.save(existingCust);
      } else {
        await custRepo.save(
          custRepo.create({
            userid: userId,
            customercity: dto.customercity ?? null,
            customerzipcode: dto.customerzipcode ?? null,
          }),
        );
      }
    }

    // BORRAR ASOCIACIONES SI YA NO ES TECNICO NI CLIENTE
    else {
      if (existingTech) {
        await cleanupTechnician(manager, existingTech);
      }

      if (existingCust) {
        await cleanupCustomer(manager, existingCust);
      }
    }
  }

  // DELETE
  async remove(id: number) {
    return await this.dataSource.transaction(async manager => {
      const usersRepo = manager.getRepository(Users);

      const user = await usersRepo.findOne({ where: { userid: id } });
      if (!user) throw new NotFoundException('Usuario no encontrado.');

      const roleName = await this.getRoleNameByRoleId(user.roleid);

      const technician = await manager
        .getRepository(Technicians)
        .findOne({ where: { userid: id } });

      const customer = await manager
        .getRepository(Customers)
        .findOne({ where: { userid: id } });

      // Validar asociaciones
      const hasAssoc = await hasUserLinkedRecords(
        manager,
        customer ? [customer.customerid] : [],
        technician ? [technician.technicianid] : [],
        this.getOrdersTechnicianColumn.bind(this),
        this.existsByIds.bind(this),
        this.existsQuotesByOrders.bind(this),
      );

      if (hasAssoc) {
        throw new BadRequestException(
          'El usuario tiene registros asociados y no puede eliminarse.',
        );
      }

      // Limpieza
      if (technician) await cleanupTechnician(manager, technician);
      if (roleName === 'cliente' && customer)
        await cleanupCustomer(manager, customer);

      await usersRepo.remove(user);

      return { success: true, message: 'Usuario eliminado correctamente.' };
    });
  }

  // UTILIDADES SQL USADAS POR linked-records.helper
  private buildPlaceholders(values: number[]) {
    return values.map((_, idx) => `$${idx + 1}`).join(', ');
  }

  private async existsByIds(
    table: string,
    column: string,
    ids: number[],
  ): Promise<boolean> {
    if (!ids.length) return false;
    const placeholders = this.buildPlaceholders(ids);
    const [result] = await this.dataSource.query(
      `SELECT EXISTS(
          SELECT 1 FROM ${table} WHERE ${column} IN (${placeholders})
        ) AS exists_flag;`,
      ids,
    );
    return Boolean(result?.exists_flag);
  }

  private async existsQuotesByOrders(
    field: string,
    ids: number[],
  ): Promise<boolean> {
    if (!ids.length) return false;

    const placeholders = this.buildPlaceholders(ids);

    const [result] = await this.dataSource.query(
      `SELECT EXISTS(
         SELECT 1 FROM quotes q
         JOIN ordersservices os ON os.ordersservicesid = q.ordersservicesid
         WHERE os.${field} IN (${placeholders})
       ) AS exists_flag`,
      ids,
    );

    return Boolean(result?.exists_flag);
  }

  private ordersTechColumn: string | null | undefined;

  private async getOrdersTechnicianColumn(): Promise<string | null> {
    if (this.ordersTechColumn !== undefined) return this.ordersTechColumn;

    const rows = await this.dataSource.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE LOWER(table_name) = 'ordersservices'
        AND column_name IN (
          'technicalid','technicianid','technical_id','technician_id'
        )
      LIMIT 1;
    `);

    const found = rows?.[0]?.column_name ?? null;
    this.ordersTechColumn = found;

    return found;
  }

  // FINDERS
  async findAll() {
    return await this.dataSource.transaction(async manager => {
      const repo = manager.getRepository(Users);

      const users = await repo
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.states', 'state')
        .leftJoinAndSelect('user.typeofdocuments', 'docType')
        .leftJoinAndSelect('user.roles', 'role')
        .leftJoinAndSelect('user.technicians', 'tech')
        .leftJoinAndSelect('tech.technicianTypeMaps', 'map')
        .leftJoinAndSelect('map.techniciantype', 'techType')
        .leftJoinAndSelect('user.customers', 'cust')
        .orderBy('user.userid', 'ASC')
        .cache('users_list', 60000)
        .getMany();

      const enriched = await Promise.all(
        users.map(async user => {
          const customerIds =
            user.customers?.map(c => c.customerid).filter(Boolean) ?? [];
          const technicianIds =
            user.technicians?.map(t => t.technicianid).filter(Boolean) ?? [];

          const hasAssoc = await hasUserLinkedRecords(
            manager,
            customerIds,
            technicianIds,
            this.getOrdersTechnicianColumn.bind(this),
            this.existsByIds.bind(this),
            this.existsQuotesByOrders.bind(this),
          );

          return { ...user, hasAssociations: hasAssoc };
        }),
      );

      return enriched;
    });
  }

  async findOne(id: number) {
    const user = await this.usersRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.states', 'state')
      .leftJoinAndSelect('user.typeofdocuments', 'docType')
      .leftJoinAndSelect('user.roles', 'role')
      .leftJoinAndSelect('user.technicians', 'tech')
      .leftJoinAndSelect('tech.technicianTypeMaps', 'map')
      .leftJoinAndSelect('map.techniciantype', 'tType')
      .leftJoinAndSelect('user.customers', 'cust')
      .where('user.userid = :id', { id })
      .getOne();

    if (!user) throw new NotFoundException('Usuario no encontrado.');

    const manager = this.dataSource.manager;
    const customerIds =
      user.customers?.map(c => c.customerid).filter(Boolean) ?? [];
    const technicianIds =
      user.technicians?.map(t => t.technicianid).filter(Boolean) ?? [];

    const hasAssoc = await hasUserLinkedRecords(
      manager,
      customerIds,
      technicianIds,
      this.getOrdersTechnicianColumn.bind(this),
      this.existsByIds.bind(this),
      this.existsQuotesByOrders.bind(this),
    );

    return { success: true, data: { ...user, hasAssociations: hasAssoc } };
  }

  // PASSWORD CHANGE

  async changePassword(id: number, oldPass: string, newPass: string) {
    const user = await this.usersRepo.findOne({ where: { userid: id } });

    if (!user) throw new NotFoundException('Usuario no encontrado.');

    const matches = await bcrypt.compare(oldPass, user.password);
    if (!matches) {
      throw new BadRequestException('Contraseña actual incorrecta.');
    }

    const hashed = await bcrypt.hash(newPass, 10);

    user.password = hashed;
    user.mustchangepassword = false;
    user.updateat = new Date();

    await this.usersRepo.save(user);

    return { success: true, message: 'Contraseña actualizada.' };
  }
}
