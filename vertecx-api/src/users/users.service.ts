import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Not, Repository } from 'typeorm';
import { Users } from './entities/users.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Typeofdocuments } from 'src/shared/entities/typeofdocuments.entity';
import { States } from 'src/shared/entities/states.entity';
import { MailService } from 'src/shared/mail/mail.service';
import { generateRandomPassword } from 'src/shared/utils/generate-password';
import * as bcrypt from 'bcrypt';
import { Technicians } from 'src/technicians/entities/technicians.entity';
import { Customers } from 'src/customers/entities/customers.entity';
import { Roles } from 'src/roles/entities/roles.entity';
import { Techniciantypes } from 'src/technicians/entities/technician_types.entity';
import { TechnicianTypeMap } from 'src/shared/entities/technician-type-map.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,

    @InjectRepository(Typeofdocuments)
    private readonly docTypeRepository: Repository<Typeofdocuments>,

    @InjectRepository(States)
    private readonly statesRepository: Repository<States>,

    @InjectRepository(Technicians)
    private readonly technicianRepo: Repository<Technicians>,

    @InjectRepository(Customers)
    private readonly customerRepo: Repository<Customers>,

    @InjectRepository(Roles)
    private readonly rolesRepo: Repository<Roles>,

    @InjectRepository(Techniciantypes)
    private readonly technicianTypeRepo: Repository<Techniciantypes>,

    @InjectRepository(TechnicianTypeMap)
    private readonly technicianTypeMapRepo: Repository<TechnicianTypeMap>,

    private readonly mailService: MailService,

    private readonly dataSource: DataSource,
  ) {}

  private async getRoleById(roleId: number): Promise<Roles> {
    const role = await this.rolesRepo.findOne({ where: { roleid: roleId } });
    if (!role) {
      throw new BadRequestException('Rol inválido.');
    }
    return role;
  }

  private async getRoleNameByRoleId(roleId: number): Promise<string> {
    const role = await this.getRoleById(roleId);
    return role.name.trim().toLowerCase();
  }

  async getRoleIdByName(name: string): Promise<number> {
    const role = await this.rolesRepo
      .createQueryBuilder('r')
      .where('LOWER(r.name) = LOWER(:name)', { name })
      .getOne();

    if (!role) {
      throw new BadRequestException('No se encontró el rol "' + name + '".');
    }

    return role.roleid;
  }
  private buildPlaceholders(values: number[]) {
    return values.map((_, idx) => `$${idx + 1}`).join(', ');
  }

  private async countQuotesByOrders(
    field: 'clientid' | 'technicalid',
    ids: number[],
  ): Promise<number> {
    if (ids.length === 0) return 0;
    const placeholders = this.buildPlaceholders(ids);
    const [result] = await this.dataSource.query(
      `SELECT COUNT(*)::int AS count
       FROM quotes q
       JOIN ordersservices os ON os.ordersservicesid = q.ordersservicesid
       WHERE os.${field} IN (${placeholders})`,
      ids,
    );
    return Number(result?.count ?? 0);
  }

  private async countByIds(
    table: string,
    column: string,
    ids: number[],
  ): Promise<number> {
    if (ids.length === 0) return 0;
    const placeholders = this.buildPlaceholders(ids);
    const [result] = await this.dataSource.query(
      `SELECT COUNT(*)::int AS count FROM ${table} WHERE ${column} IN (${placeholders})`,
      ids,
    );
    return Number(result?.count ?? 0);
  }

  private async hasUserLinkedRecords(
    customerIds: number[],
    technicianIds: number[],
  ): Promise<boolean> {
    const checks: Promise<number>[] = [];

    if (customerIds.length > 0) {
      checks.push(this.countByIds('sales', 'customerid', customerIds));
      checks.push(this.countByIds('servicerequests', 'clientid', customerIds));
      checks.push(this.countByIds('ordersservices', 'clientid', customerIds));
      checks.push(this.countQuotesByOrders('clientid', customerIds));
    }

    if (technicianIds.length > 0) {
      checks.push(
        this.countByIds('ordersservices', 'technicalid', technicianIds),
      );
      checks.push(this.countQuotesByOrders('technicalid', technicianIds));
    }

    if (checks.length === 0) return false;

    const totals = await Promise.all(checks);
    return totals.some((count) => count > 0);
  }

  // Crear usuario
  async create(createUserDto: CreateUserDto) {
    const exists = await this.usersRepository.findOne({
      where: [
        { documentnumber: createUserDto.documentnumber },
        { email: createUserDto.email },
        { phone: createUserDto.phone },
      ],
    });

    if (exists) {
      throw new BadRequestException(
        "Ya existe un usuario con el mismo correo, documento o teléfono.",
      );
    }

    const documentType = await this.docTypeRepository.findOne({
      where: { typeofdocumentid: createUserDto.typeid },
    });
    if (!documentType)
      throw new BadRequestException('Tipo de documento inválido.');

    const state = await this.statesRepository.findOne({
      where: { stateid: createUserDto.stateid },
    });
    if (!state) throw new BadRequestException('Estado inválido.');

    const isNit = documentType.name?.toUpperCase() === 'NIT';
    createUserDto.isNit = isNit;

    if (isNit) {
      createUserDto.lastname = null;
    }

    let resolvedRoleId = createUserDto.roleid;

    if (isNit && !resolvedRoleId) {
      resolvedRoleId = await this.getRoleIdByName('cliente');
    }

    if (!resolvedRoleId) {
      throw new BadRequestException('El rol es obligatorio.');
    }

    const role = await this.getRoleById(resolvedRoleId);
    createUserDto.roleid = role.roleid;

    const plainPassword = generateRandomPassword(10);
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const newUser = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
      createat: new Date(),
      updateat: null,
      typeid: documentType.typeofdocumentid,
      stateid: state.stateid,
      roleid: role.roleid,
    });

    const saved = await this.usersRepository.save(newUser);

    const roleName = role.name.trim().toLowerCase();

    if (roleName === 'tecnico') {
      const technician = this.technicianRepo.create({
        userid: saved.userid,
        CV: createUserDto.CV ?? '',
      });
      const savedTechnician = await this.technicianRepo.save(technician);

      const typeIds = createUserDto.techniciantypeids || [];
      if (typeIds.length > 0) {
        const validTypes = await this.technicianTypeRepo.find({
          where: { techniciantypeid: In(typeIds) },
        });

        if (validTypes.length !== typeIds.length) {
          throw new BadRequestException(
            'Uno o más tipos de técnico no son válidos.',
          );
        }

        const mappings = typeIds.map((typeId) =>
          this.technicianTypeMapRepo.create({
            technicianid: savedTechnician.technicianid,
            techniciantypeid: typeId,
          }),
        );

        await this.technicianTypeMapRepo.save(mappings);
      }
    } else if (roleName === 'cliente') {
      const customer = this.customerRepo.create({
        userid: saved.userid,
        customercity: createUserDto.customercity ?? null,
        customerzipcode: createUserDto.customerzipcode ?? null,
      });
      await this.customerRepo.save(customer);
    }

    if (saved.email) {
      await this.mailService.sendUserPassword(
        saved.email,
        saved.name,
        plainPassword,
      );
    }

    return {
      success: true,
      message: isNit
        ? 'Empresa registrada correctamente (NIT) y contraseña enviada al correo.'
        : 'Usuario creado correctamente y contraseña enviada al correo.',
      data: {
        ...saved,
        password: undefined,
      },
    };
  }

  // Listar todos
  async findAll() {
    const users = await this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.states', 'state')
      .leftJoinAndSelect('user.typeofdocuments', 'docType')
      .leftJoinAndSelect('user.roles', 'role')
      .leftJoinAndSelect('user.technicians', 'tech')
      .leftJoinAndSelect('tech.technicianTypeMaps', 'typeMap')
      .leftJoinAndSelect('typeMap.techniciantype', 'techType')
      .leftJoinAndSelect('user.customers', 'cust')
      .orderBy('user.userid', 'ASC')
      .getMany();

    return { success: true, data: users };
  }

  // Buscar por ID
  async findOne(id: number) {
    const user = await this.usersRepository
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

    if (!user)
      throw new NotFoundException(`Usuario con ID ${id} no encontrado.`);
    return { success: true, data: user };
  }

    // Actualizar usuario
  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.usersRepository.findOne({
      where: { userid: id },
    });
    if (!user)
      throw new NotFoundException(`Usuario con ID ${id} no encontrado.`);

    const oldEmail = user.email;

    const duplicateWhere: any[] = [];

    if (updateUserDto.email) {
      duplicateWhere.push({ email: updateUserDto.email, userid: Not(id) });
    }
    if (updateUserDto.documentnumber) {
      duplicateWhere.push({
        documentnumber: updateUserDto.documentnumber,
        userid: Not(id),
      });
    }
    if (updateUserDto.phone) {
      duplicateWhere.push({ phone: updateUserDto.phone, userid: Not(id) });
    }

    if (duplicateWhere.length > 0) {
      const duplicate = await this.usersRepository.findOne({
        where: duplicateWhere,
      });
      if (duplicate) {
        throw new BadRequestException(
          'Ya existe un usuario con el mismo correo, documento o teléfono.',
        );
      }
    }

    let isNit = false;
    if (updateUserDto.typeid) {
      const docType = await this.docTypeRepository.findOne({
        where: { typeofdocumentid: updateUserDto.typeid },
      });
      if (!docType)
        throw new BadRequestException('Tipo de documento inválido.');

      isNit = docType.name?.toUpperCase() === 'NIT';
      updateUserDto.isNit = isNit;

      if (isNit) {
        updateUserDto.lastname = null;
      }
    }

    if (updateUserDto.stateid) {
      const state = await this.statesRepository.findOne({
        where: { stateid: updateUserDto.stateid },
      });
      if (!state) throw new BadRequestException('Estado inválido.');
    }

    if (updateUserDto.roleid !== undefined) {
      await this.getRoleById(updateUserDto.roleid);
    }

    let resolvedRoleId = updateUserDto.roleid ?? user.roleid;

    if (isNit && !updateUserDto.roleid) {
      resolvedRoleId = await this.getRoleIdByName('cliente');
      updateUserDto.roleid = resolvedRoleId;
    }

    if (!resolvedRoleId) {
      throw new BadRequestException('El rol es obligatorio.');
    }

    let newPlainPassword: string | null = null;
    const emailChanged =
      !!updateUserDto.email && updateUserDto.email !== oldEmail;

    if (emailChanged) {
      newPlainPassword = generateRandomPassword(10);
      const hashed = await bcrypt.hash(newPlainPassword, 10);
      updateUserDto.password = hashed;
    }

    const updatedUser = this.usersRepository.merge(user, {
      ...updateUserDto,
      roleid: resolvedRoleId,
      updateat: new Date(),
    });

    const saved = await this.usersRepository.save(updatedUser);

    if (emailChanged && newPlainPassword) {
      await this.mailService.sendUserPassword(
        saved.email,
        saved.name,
        newPlainPassword,
      );
    }

    const fieldTranslations: Record<string, string> = {
      name: 'Nombre',
      lastname: 'Apellido',
      email: 'Correo electrónico',
      phone: 'Teléfono',
      documentnumber: 'Número de documento',
      typeid: 'Tipo de documento',
      image: 'Imagen de perfil',
      stateid: 'Estado',
      roleid: 'Rol',
      CV: 'Hoja de vida (CV)',
      customercity: 'Ciudad del cliente',
      customerzipcode: 'Código postal',
      isNit: '¿Es NIT?',
    };

    const translatedChanges = await Promise.all(
      Object.entries(updateUserDto)
        .filter(([key]) => key !== 'password' && key !== 'updateat')
        .map(async ([key, value]) => {
          const label = fieldTranslations[key] || key;

          if (value === null || value === undefined || value === '') {
            return `<b>${label}:</b> No hay información`;
          }

          if (key === 'roleid') {
            const roleName = await this.getRoleNameByRoleId(Number(value));
            return `<b>${label}:</b> ${
              roleName.charAt(0).toUpperCase() + roleName.slice(1)
            }`;
          }

          if (typeof value === 'boolean') {
            return `<b>${label}:</b> ${value ? 'Sí' : 'No'}`;
          }

          return `<b>${label}:</b> ${value}`;
        }),
    );

    const formattedHtml = translatedChanges.join('<br/>');

    await this.mailService.sendUpdateNotification(
      saved.email,
      saved.name,
      formattedHtml,
    );

    const usedRoleId = resolvedRoleId;
    const roleName = await this.getRoleNameByRoleId(usedRoleId);

    let existingTechnician: Technicians | null = null;
    let existingCustomer: Customers | null = null;

    if (roleName === 'tecnico') {
      existingTechnician = await this.technicianRepo.findOne({
        where: { userid: id },
      });
    } else if (roleName === 'cliente') {
      existingTechnician = await this.technicianRepo.findOne({
        where: { userid: id },
      });
      existingCustomer = await this.customerRepo.findOne({
        where: { userid: id },
      });
    } else {
      existingTechnician = await this.technicianRepo.findOne({
        where: { userid: id },
      });
      existingCustomer = await this.customerRepo.findOne({
        where: { userid: id },
      });
    }

    if (roleName === 'tecnico') {
      if (existingCustomer) {
        await this.customerRepo.remove(existingCustomer);
      }

      let savedTechnician: Technicians;

      if (existingTechnician) {
        existingTechnician.CV = updateUserDto.CV ?? existingTechnician.CV;
        savedTechnician = await this.technicianRepo.save(existingTechnician);
      } else {
        const newTech = this.technicianRepo.create({
          userid: id,
          CV: updateUserDto.CV ?? '',
        });
        savedTechnician = await this.technicianRepo.save(newTech);
      }

      if (updateUserDto.techniciantypeids !== undefined) {
        const typeIds = updateUserDto.techniciantypeids;

        await this.technicianTypeMapRepo.delete({
          technicianid: savedTechnician.technicianid,
        });

        if (typeIds.length > 0) {
          const validTypes = await this.technicianTypeRepo.find({
            where: { techniciantypeid: In(typeIds) },
          });

          if (validTypes.length !== typeIds.length) {
            throw new BadRequestException(
              'Uno o más tipos de técnico no son válidos.',
            );
          }

          const mappings = typeIds.map((typeId) =>
            this.technicianTypeMapRepo.create({
              technicianid: savedTechnician.technicianid,
              techniciantypeid: typeId,
            }),
          );

          await this.technicianTypeMapRepo.save(mappings);
        }
      }
    } else if (roleName === 'cliente' || isNit) {
      if (existingTechnician) {
        await this.technicianRepo.remove(existingTechnician);
      }

      if (existingCustomer) {
        this.customerRepo.merge(existingCustomer, {
          customercity:
            updateUserDto.customercity ?? existingCustomer.customercity,
          customerzipcode:
            updateUserDto.customerzipcode ??
            existingCustomer.customerzipcode,
        });
        await this.customerRepo.save(existingCustomer);
      } else {
        const newCust = this.customerRepo.create({
          userid: id,
          customercity: updateUserDto.customercity ?? null,
          customerzipcode: updateUserDto.customerzipcode ?? null,
        });
        await this.customerRepo.save(newCust);
      }
    } else {
      if (existingTechnician) {
        await this.technicianRepo.remove(existingTechnician);
      }
      if (existingCustomer) {
        await this.customerRepo.remove(existingCustomer);
      }
    }

    return {
      success: true,
      message: emailChanged
        ? 'Usuario actualizado. Se envió nueva contraseña y notificación al nuevo correo.'
        : 'Usuario actualizado correctamente.',
      data: saved,
    };
  }

  async remove(id: number) {
    const user = await this.usersRepository.findOne({
      where: { userid: id },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado.`);
    }

    const roleName = await this.getRoleNameByRoleId(user.roleid);

    const [technician, customer] = await Promise.all([
      this.technicianRepo.findOne({ where: { userid: id } }),
      this.customerRepo.findOne({ where: { userid: id } }),
    ]);

    const hasAssociations = await this.hasUserLinkedRecords(
      customer ? [customer.customerid] : [],
      technician ? [technician.technicianid] : [],
    );

    if (hasAssociations) {
      throw new BadRequestException(
        'El usuario no se puede eliminar porque tiene registros asociados (ventas, compras, solicitudes de servicio, ordenes de servicio o cotizaciones).',
      );
    }

    if (technician) {
      await this.technicianTypeMapRepo.delete({
        technicianid: technician.technicianid,
      });

      await this.technicianRepo.remove(technician);
    }

    if (roleName === 'cliente') {
      if (customer) {
        await this.customerRepo.remove(customer);
      }
    }

    await this.usersRepository.remove(user);
    return { success: true, message: `Usuario con ID ${id} eliminado.` };
  }
}





