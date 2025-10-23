import { Injectable } from '@nestjs/common';
import { CreateAppoimentDto } from './dto/create-appoiment.dto';
import { UpdateAppoimentDto } from './dto/update-appoiment.dto';

@Injectable()
export class AppoimentsService {
  create(createAppoimentDto: CreateAppoimentDto) {
    return 'This action adds a new appoiment';
  }

  findAll() {
    return `This action returns all appoiments`;
  }

  findOne(id: number) {
    return `This action returns a #${id} appoiment`;
  }

  update(id: number, updateAppoimentDto: UpdateAppoimentDto) {
    return `This action updates a #${id} appoiment`;
  }

  remove(id: number) {
    return `This action removes a #${id} appoiment`;
  }
}
