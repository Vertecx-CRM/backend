import { Injectable, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customers } from './entities/customers.entity';
import { Users } from '../users/entities/users.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerResponseDto } from './dto/customer-response.dto';


@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customers)
    private customersRepository: Repository<Customers>,
    @InjectRepository(Users)
    private usersRepository: Repository<Users>,
  ) {}

  async create(createCustomerDto: CreateCustomerDto): Promise<CustomerResponseDto> {
    try {
      // Verificar si el usuario existe
      const user = await this.usersRepository.findOne({
        where: { userid: createCustomerDto.userid }
      });

      if (!user) {
        throw new NotFoundException(`Usuario con ID ${createCustomerDto.userid} no encontrado`);
      }

      // Verificar si ya existe un cliente para este usuario
      const existingCustomer = await this.customersRepository.findOne({
        where: { userid: createCustomerDto.userid }
      });

      if (existingCustomer) {
        throw new ConflictException('Ya existe un cliente para este usuario');
      }

      // Crear el cliente
      const customer = this.customersRepository.create(createCustomerDto);
      const savedCustomer = await this.customersRepository.save(customer);

      return new CustomerResponseDto(savedCustomer);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al crear el cliente');
    }
  }

  async findAll(includeRelations: boolean = false): Promise<CustomerResponseDto[]> {
    try {
      const relations = [];
      if (includeRelations) {
        relations.push('users', 'sales');
      }

      const customers = await this.customersRepository.find({
        relations: relations,
        order: { customerid: 'ASC' }
      });

      return customers.map(customer => new CustomerResponseDto(customer));
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener los clientes');
    }
  }

  async findOne(id: number, includeRelations: boolean = false): Promise<CustomerResponseDto> {
    try {
      const relations = [];
      if (includeRelations) {
        relations.push('users', 'sales');
      }

      const customer = await this.customersRepository.findOne({
        where: { customerid: id },
        relations: relations
      });

      if (!customer) {
        throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
      }

      return new CustomerResponseDto(customer);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al obtener el cliente');
    }
  }

  async findByUserId(userId: number, includeRelations: boolean = false): Promise<CustomerResponseDto> {
    try {
      const relations = [];
      if (includeRelations) {
        relations.push('users', 'sales');
      }

      const customer = await this.customersRepository.findOne({
        where: { userid: userId },
        relations: relations
      });

      if (!customer) {
        throw new NotFoundException(`Cliente para el usuario con ID ${userId} no encontrado`);
      }

      return new CustomerResponseDto(customer);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al obtener el cliente por usuario');
    }
  }

  async update(id: number, updateCustomerDto: UpdateCustomerDto): Promise<CustomerResponseDto> {
    try {
      const customer = await this.customersRepository.findOne({
        where: { customerid: id }
      });

      if (!customer) {
        throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
      }

      // Actualizar solo los campos proporcionados
      Object.assign(customer, updateCustomerDto);
      const updatedCustomer = await this.customersRepository.save(customer);

      return new CustomerResponseDto(updatedCustomer);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al actualizar el cliente');
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    try {
      const customer = await this.customersRepository.findOne({
        where: { customerid: id },
        relations: ['sales']
      });

      if (!customer) {
        throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
      }

      if (customer.sales && customer.sales.length > 0) {
        throw new ConflictException('No se puede eliminar el cliente porque tiene ventas asociadas');
      }

      await this.customersRepository.remove(customer);

      return { message: `Cliente con ID ${id} eliminado correctamente` };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al eliminar el cliente');
    }
  }

  async findByCity(city: string): Promise<CustomerResponseDto[]> {
    try {
      const customers = await this.customersRepository.find({
        where: { customercity: city },
        relations: ['users'],
        order: { customerid: 'ASC' }
      });

      return customers.map(customer => new CustomerResponseDto(customer));
    } catch (error) {
      throw new InternalServerErrorException('Error al buscar clientes por ciudad');
    }
  }

  async count(): Promise<number> {
    try {
      return await this.customersRepository.count();
    } catch (error) {
      throw new InternalServerErrorException('Error al contar clientes');
    }
  }
}