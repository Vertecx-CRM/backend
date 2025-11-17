import { Controller, Get } from '@nestjs/common';
import { TypeofdocumentsService } from './typeofdocuments.service';

@Controller('typeofdocuments')
export class TypeofdocumentsController {
  constructor(private readonly typeofdocumentsService: TypeofdocumentsService) {}

  @Get()
  async findAll() {
    const data = await this.typeofdocumentsService.findAll();
    return { success: true, data };
  }
}
