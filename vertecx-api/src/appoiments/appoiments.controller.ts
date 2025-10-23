import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AppoimentsService } from './appoiments.service';
import { CreateAppoimentDto } from './dto/create-appoiment.dto';
import { UpdateAppoimentDto } from './dto/update-appoiment.dto';

@Controller('appoiments')
export class AppoimentsController {
  constructor(private readonly appoimentsService: AppoimentsService) {}

  @Post()
  create(@Body() createAppoimentDto: CreateAppoimentDto) {
    return this.appoimentsService.create(createAppoimentDto);
  }

  @Get()
  findAll() {
    return this.appoimentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.appoimentsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAppoimentDto: UpdateAppoimentDto) {
    return this.appoimentsService.update(+id, updateAppoimentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.appoimentsService.remove(+id);
  }
}
