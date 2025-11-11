import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Typeofdocuments } from 'src/shared/entities/typeofdocuments.entity';
import { States } from 'src/shared/entities/states.entity';
import { MailService } from 'src/shared/mail/mail.service';
import { generateRandomPassword } from 'src/shared/utils/generate-password';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,

    @InjectRepository(Typeofdocuments)
    private readonly docTypeRepository: Repository<Typeofdocuments>,

    @InjectRepository(States)
    private readonly statesRepository: Repository<States>,

    private readonly mailService: MailService,
  ) { }

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
        'Ya existe un usuario con el mismo correo o número de documento.',
      );
    }

    const documentType = await this.docTypeRepository.findOne({
      where: { typeofdocumentid: createUserDto.typeid },
    });
    if (!documentType) throw new BadRequestException('Tipo de documento inválido.');

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

    // Enviar correo con la contraseña generada
    await this.mailService.sendUserPassword(saved.email, saved.name, plainPassword);

    return {
      success: true,
      message: 'Usuario creado correctamente y contraseña enviada al correo.',
      data: {
        ...saved,
        password: undefined,
      },
    };
  }

  // Listar todos
  async findAll() {
    const users = await this.usersRepository.find({
      relations: [
        'states',
        'typeofdocuments',
        'roleconfiguration',
        'roleconfiguration.roles',
        'roleconfiguration.permissions',
        'roleconfiguration.privileges',
      ],
      order: { userid: 'ASC' },
    });

    return { success: true, data: users };
  }

  // Buscar por ID
  async findOne(id: number) {
    const user = await this.usersRepository.findOne({
      where: { userid: id },
      relations: [
        'states',
        'typeofdocuments',
        'roleconfiguration',
        'roleconfiguration.roles',       
        'roleconfiguration.permissions', 
        'roleconfiguration.privileges',  
      ],
    });

    if (!user) throw new NotFoundException(`Usuario con ID ${id} no encontrado.`);
    return { success: true, data: user };
  }

  // Actualizar usuario
  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.usersRepository.findOne({ where: { userid: id } });
    if (!user) throw new NotFoundException(`Usuario con ID ${id} no encontrado.`);

    // Validar duplicados
    if (updateUserDto.email || updateUserDto.documentnumber) {
      const duplicate = await this.usersRepository.findOne({
        where: [
          { email: updateUserDto.email, userid: Not(id) },
          { documentnumber: updateUserDto.documentnumber, userid: Not(id) },
        ],
      });
      if (duplicate) {
        throw new BadRequestException(
          'Ya existe un usuario con el mismo correo o número de documento.',
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
    return {
      success: true,
      message: 'Usuario actualizado correctamente.',
      data: saved,
    };
  }

  // Eliminar usuario
  async remove(id: number) {
    const user = await this.usersRepository.findOne({ where: { userid: id } });
    if (!user) throw new NotFoundException(`Usuario con ID ${id} no encontrado.`);

    await this.usersRepository.remove(user);
    return { success: true, message: `Usuario con ID ${id} eliminado.` };
  }
}
