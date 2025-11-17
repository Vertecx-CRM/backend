import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Typeofdocuments } from 'src/shared/entities/typeofdocuments.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TypeofdocumentsService {
  constructor(
    @InjectRepository(Typeofdocuments)
    private readonly docRepo: Repository<Typeofdocuments>,
  ) {}

  async findAll() {
    return await this.docRepo.find({
      order: { typeofdocumentid: 'ASC' },
    });
  }
}
