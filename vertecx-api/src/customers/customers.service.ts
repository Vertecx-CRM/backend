import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  HttpException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Customers } from './entities/customers.entity';
import { Sales } from 'src/sales/entities/sales.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerResponseDto } from './dto/customer-response.dto';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UpdateUserDto } from '../users/dto/update-user.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customers)
    private readonly customersRepository: Repository<Customers>,
    @InjectRepository(Sales)
    private readonly salesRepository: Repository<Sales>,
    private readonly usersService: UsersService,
  ) { }

  private readonly logger = new Logger(CustomersService.name);

  // ================================
  // CREATE
  // ================================
  async create(
    createCustomerDto: CreateCustomerDto,
  ): Promise<CustomerResponseDto> {
    try {
      const roleId = await this.usersService.getRoleIdByName('Cliente');

      const userDto: CreateUserDto = {
        name: createCustomerDto.name,
        lastname: createCustomerDto.lastname,
        email: createCustomerDto.email,
        documentnumber: createCustomerDto.documentnumber,
        phone: createCustomerDto.phone,
        typeid: createCustomerDto.typeid,
        image: createCustomerDto.image || '', // ← permite string vacío
        stateid: 1,
        roleid: roleId,
        customercity: createCustomerDto.customercity,
        customerzipcode: createCustomerDto.customerzipcode,
      };

      const userResponse = await this.usersService.create(userDto);
      const createdUser = userResponse.data;

      return await this.findOneByUserId(createdUser.userid);
    } catch (error) {
      this.logger.error(`Error al crear cliente: ${error.message}`, error.stack);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Error al crear el cliente');
    }
  }

  // ================================
  // FIND ONE BY USER ID
  // ================================
  async findOneByUserId(userId: number): Promise<CustomerResponseDto> {
    const customer = await this.customersRepository.findOne({
      where: { userid: userId },
      relations: [
        'users',
        'users.typeofdocuments',
        'users.states',
        'users.roles',
        'sales',
      ],
    });

    if (!customer) {
      throw new NotFoundException('Cliente no encontrado');
    }

    return new CustomerResponseDto(customer);
  }

  // ================================
  // FIND ALL
  // ================================
  async findAll(): Promise<CustomerResponseDto[]> {
    try {
      const customers = await this.customersRepository.find({
        relations: [
          'users',
          'users.typeofdocuments',
          'users.states',
          'users.roles',
          'sales',
        ],
        order: { customerid: 'ASC' },
      });

      return customers.map((customer) => new CustomerResponseDto(customer));
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener los clientes');
    }
  }

  // ================================
  // FIND ONE
  // ================================
  async findOne(id: number): Promise<CustomerResponseDto> {
    try {
      const customer = await this.customersRepository.findOne({
        where: { customerid: id },
        relations: [
          'users',
          'users.typeofdocuments',
          'users.states',
          'users.roles',
          'sales',
        ],
      });

      if (!customer) {
        throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
      }

      return new CustomerResponseDto(customer);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Error al obtener el cliente');
    }
  }

  // ================================
  // UPDATE
  // ================================
  async update(
    id: number,
    updateCustomerDto: UpdateCustomerDto,
  ): Promise<CustomerResponseDto> {
    try {
      const customer = await this.customersRepository.findOne({
        where: { customerid: id },
      });

      if (!customer) {
        throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
      }

      const userDto: UpdateUserDto = {};

      if (updateCustomerDto.name) userDto.name = updateCustomerDto.name;
      if (updateCustomerDto.lastname)
        userDto.lastname = updateCustomerDto.lastname;
      if (updateCustomerDto.email) userDto.email = updateCustomerDto.email;
      if (updateCustomerDto.documentnumber)
        userDto.documentnumber = updateCustomerDto.documentnumber;
      if (updateCustomerDto.phone) userDto.phone = updateCustomerDto.phone;
      if (updateCustomerDto.typeid) userDto.typeid = updateCustomerDto.typeid;
      if (updateCustomerDto.image) userDto.image = updateCustomerDto.image;
      if (updateCustomerDto.stateid) userDto.stateid = updateCustomerDto.stateid;

      if (Object.keys(userDto).length > 0) {
        await this.usersService.update(customer.userid, userDto);
      }

      if (updateCustomerDto.customercity)
        customer.customercity = updateCustomerDto.customercity;

      if (updateCustomerDto.customerzipcode)
        customer.customerzipcode = updateCustomerDto.customerzipcode;

      await this.customersRepository.save(customer);

      return await this.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Error al actualizar el cliente');
    }
  }

  // ================================
  // REMOVE – con restricción de ventas activas
  // ================================
  async remove(id: number): Promise<{ message: string }> {
    try {
      const customer = await this.customersRepository.findOne({
        where: { customerid: id },
      });

      if (!customer) {
        throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
      }

      // 🔒 Bloquear eliminación si tiene ventas en estado pendiente o abonada
      const activeStatuses = ['Pending', 'Abonada'];
      const activeCount = await this.salesRepository.count({
        where: {
          customerid: customer.userid,
          salestatus: In(activeStatuses),
        },
      });

      if (activeCount > 0) {
        throw new ConflictException(
          `No se puede eliminar el cliente porque tiene ${activeCount} venta(s) en estado Pendiente o Abonada.`,
        );
      }

      try {
        await this.usersService.remove(customer.userid);
      } catch (error) {
        if (error.code === '23503') {
          throw new ConflictException(
            'No se puede eliminar el cliente porque tiene registros relacionados',
          );
        }
        throw error;
      }

      return { message: `Cliente con ID ${id} eliminado correctamente` };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      )
        throw error;

      throw new InternalServerErrorException('Error al eliminar el cliente');
    }
  }

  // ================================
  // COUNT
  // ================================
  async count(): Promise<number> {
    try {
      return await this.customersRepository.count();
    } catch (error) {
      throw new InternalServerErrorException('Error al contar clientes');
    }
  }
}