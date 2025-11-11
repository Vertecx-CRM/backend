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
import { Roleconfiguration } from 'src/roles/entities/roleconfiguration.entity';
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

    @InjectRepository(Roleconfiguration)
    private readonly roleConfigRepo: Repository<Roleconfiguration>,

    @InjectRepository(Techniciantypes)
    private readonly technicianTypeRepo: Repository<Techniciantypes>,

    @InjectRepository(TechnicianTypeMap)
    private readonly technicianTypeMapRepo: Repository<TechnicianTypeMap>,

    private readonly mailService: MailService,

    private readonly dataSource: DataSource,
  ) { }

  private async getRoleNameByRoleConfigId(roleConfigId: number): Promise<string> {
    const roleConfig = await this.roleConfigRepo.findOne({
      where: { roleconfigurationid: roleConfigId },
      relations: ['roles'],
    });

    if (!roleConfig || !roleConfig.roles) {
      throw new BadRequestException('Configuración de rol inválida.');
    }

    return roleConfig.roles.name.trim().toLowerCase();
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
        'Ya existe un usuario con el mismo correo, documento o teléfono.',
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

    // Generar contraseña aleatoria
    const plainPassword = generateRandomPassword(10);
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const newUser = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
      createat: new Date(),
      updateat: null,
      typeid: documentType.typeofdocumentid,
      stateid: state.stateid,
    });

    const saved = await this.usersRepository.save(newUser);

    // Manejo de técnico o cliente
    const roleName = await this.getRoleNameByRoleConfigId(
      createUserDto.roleconfigurationid,
    );

    if (roleName === 'tecnico') {
      // 1. Crear técnico
      const technician = this.technicianRepo.create({
        userid: saved.userid,
        CV: createUserDto.CV ?? '',
      });
      const savedTechnician = await this.technicianRepo.save(technician);

      // 2. Si se pasaron tipos, crear relaciones en la tabla puente
      const typeIds = createUserDto.techniciantypeids || [];
      if (typeIds.length > 0) {
        // Validar que los techniciantypeid existan
        const validTypes = await this.technicianTypeRepo.find({
          where: { techniciantypeid: In(typeIds) },
        });

        if (validTypes.length !== typeIds.length) {
          throw new BadRequestException('Uno o más tipos de técnico no son válidos.');
        }

        // Crear entradas en la tabla puente
        const mappings = typeIds.map(typeId =>
          this.technicianTypeMapRepo.create({
            technicianid: savedTechnician.technicianid,
            techniciantypeid: typeId,
          })
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

    // Enviar correo con la contraseña generada
    await this.mailService.sendUserPassword(
      saved.email,
      saved.name,
      plainPassword,
    );

    return {
      success: true,
      message:
        'Usuario creado correctamente y contraseña enviada al correo.',
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
      .leftJoinAndSelect('user.roleconfiguration', 'rc')
      .leftJoinAndSelect('rc.roles', 'role')
      .leftJoinAndSelect('rc.permissions', 'perm')
      .leftJoinAndSelect('rc.privileges', 'priv')
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
      .leftJoinAndSelect('user.roleconfiguration', 'rc')
      .leftJoinAndSelect('rc.roles', 'role')
      .leftJoinAndSelect('rc.permissions', 'perm')
      .leftJoinAndSelect('rc.privileges', 'priv')
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

    // Validar duplicados
    if (
      updateUserDto.email ||
      updateUserDto.documentnumber ||
      updateUserDto.phone
    ) {
      const duplicate = await this.usersRepository.findOne({
        where: [
          { email: updateUserDto.email, userid: Not(id) },
          { documentnumber: updateUserDto.documentnumber, userid: Not(id) },
          { phone: updateUserDto.phone, userid: Not(id) },
        ],
      });
      if (duplicate) {
        throw new BadRequestException(
          'Ya existe un usuario con el mismo correo, documento o teléfono.',
        );
      }
    }

    // Validar tipo de documento (si viene)
    if (updateUserDto.typeid) {
      const docType = await this.docTypeRepository.findOne({
        where: { typeofdocumentid: updateUserDto.typeid },
      });
      if (!docType)
        throw new BadRequestException('Tipo de documento inválido.');
    }

    // Validar estado (si viene)
    if (updateUserDto.stateid) {
      const state = await this.statesRepository.findOne({
        where: { stateid: updateUserDto.stateid },
      });
      if (!state) throw new BadRequestException('Estado inválido.');
    }

    // Actualizar usuario
    const updatedUser = this.usersRepository.merge(user, {
      ...updateUserDto,
      updateat: new Date(),
    });

    const saved = await this.usersRepository.save(updatedUser);

    // 👇 Manejo de técnico o cliente tras actualización
    const usedRoleConfigId =
      updateUserDto.roleconfigurationid ?? saved.roleconfigurationid;
    const roleName = await this.getRoleNameByRoleConfigId(usedRoleConfigId);

    const existingTechnician = await this.technicianRepo.findOne({
      where: { userid: id },
    });
    const existingCustomer = await this.customerRepo.findOne({
      where: { userid: id },
    });

    if (roleName === 'tecnico') {
      // Eliminar cliente si existe
      if (existingCustomer) {
        await this.customerRepo.remove(existingCustomer);
      }

      let savedTechnician: Technicians;

      if (existingTechnician) {
        // Actualizar CV del técnico
        existingTechnician.CV = updateUserDto.CV ?? existingTechnician.CV;
        savedTechnician = await this.technicianRepo.save(existingTechnician);
      } else {
        // Crear nuevo técnico
        const newTech = this.technicianRepo.create({
          userid: id,
          CV: updateUserDto.CV ?? '',
        });
        savedTechnician = await this.technicianRepo.save(newTech);
      }

      // 👇 Manejar los tipos de técnico (muchos a muchos)
      const typeIds = updateUserDto.techniciantypeids || [];

      // 1. Eliminar todas las relaciones actuales (para simplificar: reemplazo total)
      await this.technicianTypeMapRepo.delete({ technicianid: savedTechnician.technicianid });

      // 2. Si hay nuevos tipos, validar y crear relaciones
      if (typeIds.length > 0) {
        const validTypes = await this.technicianTypeRepo.find({
          where: { techniciantypeid: In(typeIds) },
        });

        if (validTypes.length !== typeIds.length) {
          throw new BadRequestException('Uno o más tipos de técnico no son válidos.');
        }

        const mappings = typeIds.map(typeId =>
          this.technicianTypeMapRepo.create({
            technicianid: savedTechnician.technicianid,
            techniciantypeid: typeId,
          })
        );

        await this.technicianTypeMapRepo.save(mappings);
      }
    } else if (roleName === 'cliente') {
      // Eliminar técnico si existe
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
      // Rol no es técnico ni cliente → eliminar ambos si existen
      if (existingTechnician) {
        await this.technicianRepo.remove(existingTechnician);
      }
      if (existingCustomer) {
        await this.customerRepo.remove(existingCustomer);
      }
    }

    return {
      success: true,
      message: 'Usuario actualizado correctamente.',
      data: saved,
    };
  }

  // Eliminar usuario
  async remove(id: number) {
    const user = await this.usersRepository.findOne({
      where: { userid: id },
    });
    if (!user)
      throw new NotFoundException(`Usuario con ID ${id} no encontrado.`);

    // Opcional: eliminar registros relacionados en technicians/customers
    const tech = await this.technicianRepo.findOne({ where: { userid: id } });
    const cust = await this.customerRepo.findOne({ where: { userid: id } });

    if (tech) await this.technicianRepo.remove(tech);
    if (cust) await this.customerRepo.remove(cust);

    await this.usersRepository.remove(user);
    return { success: true, message: `Usuario con ID ${id} eliminado.` };
  }
}