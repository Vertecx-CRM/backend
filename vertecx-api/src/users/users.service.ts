import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Users } from './entities/users.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Typeofdocuments } from 'src/shared/entities/typeofdocuments.entity';
import { States } from 'src/shared/entities/states.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,

    @InjectRepository(Typeofdocuments)
    private readonly docTypeRepository: Repository<Typeofdocuments>,

    @InjectRepository(States)
    private readonly statesRepository: Repository<States>,
  ) {}

  // 🟢 Crear usuario
  async create(createUserDto: CreateUserDto) {
    // 1️⃣ Validación DTO
    const errors = new CreateUserDto(createUserDto).validate();
    if (errors.length > 0) throw new BadRequestException(errors);

    // 2️⃣ Verificar duplicados
    const exists = await this.usersRepository.findOne({
      where: [
        { documentnumber: createUserDto.documentnumber },
        { email: createUserDto.email },
      ],
    });
    if (exists) {
      throw new BadRequestException('A user with the same email or document number already exists.');
    }

    // 3️⃣ Verificar tipo de documento
    const documentType = await this.docTypeRepository.findOne({
      where: { typeofdocumentid: createUserDto.typeid },
    });
    if (!documentType) {
      throw new BadRequestException(`Invalid document type (typeid: ${createUserDto.typeid}).`);
    }

    // 4️⃣ Verificar estado
    const state = await this.statesRepository.findOne({
      where: { stateid: createUserDto.stateid },
    });
    if (!state) {
      throw new BadRequestException(`Invalid state (stateid: ${createUserDto.stateid}).`);
    }

    // 5️⃣ Crear el nuevo usuario
    const newUser = this.usersRepository.create({
      name: createUserDto.name,
      lastname: createUserDto.lastname,
      email: createUserDto.email,
      password: createUserDto.password,
      phone: createUserDto.phone,
      documentnumber: createUserDto.documentnumber,
      image: createUserDto.image ?? null,
      createat: new Date(),
      updateat: null,
      typeid: documentType.typeofdocumentid,
      stateid: state.stateid,
    });

    // 6️⃣ Guardar usuario
    const saved = await this.usersRepository.save(newUser);
    return {
      success: true,
      message: 'User created successfully.',
      data: saved,
    };
  }

  // 🟡 Listar todos
  async findAll() {
    const users = await this.usersRepository.find({
      relations: ['states', 'typeofdocuments'],
      order: { userid: 'ASC' },
    });
    return { success: true, data: users };
  }

  // 🔵 Buscar por ID
  async findOne(id: number) {
    const user = await this.usersRepository.findOne({
      where: { userid: id },
      relations: ['states', 'typeofdocuments'],
    });

    if (!user) throw new NotFoundException(`User with ID ${id} not found.`);
    return { success: true, data: user };
  }

  // 🟠 Actualizar usuario
  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.usersRepository.findOne({ where: { userid: id } });
    if (!user) throw new NotFoundException(`User with ID ${id} not found.`);

    const errors = new UpdateUserDto(updateUserDto).validate();
    if (errors.length > 0) throw new BadRequestException(errors);

    // Validar duplicados
    if (updateUserDto.email || updateUserDto.documentnumber) {
      const duplicate = await this.usersRepository.findOne({
        where: [
          { email: updateUserDto.email, userid: Not(id) },
          { documentnumber: updateUserDto.documentnumber, userid: Not(id) },
        ],
      });
      if (duplicate) {
        throw new BadRequestException('Email or document number already exists.');
      }
    }

    // Validar tipo de documento (si viene)
    if (updateUserDto.typeid) {
      const docType = await this.docTypeRepository.findOne({
        where: { typeofdocumentid: updateUserDto.typeid },
      });
      if (!docType) throw new BadRequestException('Invalid document type.');
    }

    // Validar estado (si viene)
    if (updateUserDto.stateid) {
      const state = await this.statesRepository.findOne({
        where: { stateid: updateUserDto.stateid },
      });
      if (!state) throw new BadRequestException('Invalid state.');
    }

    // Actualizar usuario
    const updatedUser = this.usersRepository.merge(user, {
      name: updateUserDto.name ?? user.name,
      lastname: updateUserDto.lastname ?? user.lastname,
      email: updateUserDto.email ?? user.email,
      password: updateUserDto.password ?? user.password,
      phone: updateUserDto.phone ?? user.phone,
      documentnumber: updateUserDto.documentnumber ?? user.documentnumber,
      image: updateUserDto.image ?? user.image,
      updateat: new Date(),
      typeid: updateUserDto.typeid ?? user.typeid,
      stateid: updateUserDto.stateid ?? user.stateid,
    });

    const saved = await this.usersRepository.save(updatedUser);
    return { success: true, message: 'User updated successfully.', data: saved };
  }

  // Eliminar usuario
  async remove(id: number) {
    const user = await this.usersRepository.findOne({ where: { userid: id } });
    if (!user) throw new NotFoundException(`User with ID ${id} not found.`);

    await this.usersRepository.remove(user);
    return { success: true, message: `User with ID ${id} deleted.` };
  }
}
