// src/technicians/technicians.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TechniciansService } from './technicians.service';
import { TechniciansController } from './technicians.controller';
import { Technicians } from './entities/technicians.entity';
import { Techniciantypes } from './entities/technician_types.entity';
import { TechnicianTypeMap } from 'src/shared/entities/technician-type-map.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Technicians, Techniciantypes, TechnicianTypeMap]),
    UsersModule,
  ],
  controllers: [TechniciansController],
  providers: [TechniciansService],
})
export class TechniciansModule {}
