import { Injectable } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Repository } from 'typeorm';
import { Customers } from './entities/customers.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CustomersService {

  constructor(
    @InjectRepository(Customers) private readonly repo: Repository<Customers>,
  ) {}

  create(createCustomerDto: CreateCustomerDto) {
    return 'This action adds a new customer';
  }

async findAll() {
  return this.repo.find({ relations: ['users'] });
}
  findOne(id: number) {
    return `This action returns a #${id} customer`;
  }

  update(id: number, updateCustomerDto: UpdateCustomerDto) {
    return `This action updates a #${id} customer`;
  }

  remove(id: number) {
    return `This action removes a #${id} customer`;
  }
}
