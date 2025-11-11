// src/services/services.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Services } from './entities/services.entity';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Services) private readonly repo: Repository<Services>,
  ) {}

  create(createServiceDto: CreateServiceDto) {
    return 'This action adds a new service';
  }

  findAll() {
    return this.repo.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} service`;
  }

  update(id: number, updateServiceDto: UpdateServiceDto) {
    return `This action updates a #${id} service`;
  }

  remove(id: number) {
    return `This action removes a #${id} service`;
  }
}
