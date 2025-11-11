import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Techniciantypes } from '../entities/technician_types.entity';

@Injectable()
export class TechniciantypesService {
  constructor(
    @InjectRepository(Techniciantypes)
    private readonly techniciantypesRepo: Repository<Techniciantypes>,
  ) {}

  async findAll() {
    return this.techniciantypesRepo.find({
      where: { stateid: 1 },
      order: { name: 'ASC' },
    });
  }
}