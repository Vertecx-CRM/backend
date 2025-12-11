import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TechniciantypesService } from './techniciantypes.service';
import { Techniciantypes } from '../entities/technician_types.entity';
import { TechniciantypesController } from './techniciantypes.controller';


@Module({
  imports: [TypeOrmModule.forFeature([Techniciantypes])],
  controllers: [TechniciantypesController],
  providers: [TechniciantypesService],
  exports: [TechniciantypesService], 
})
export class TechniciantypesModule {}