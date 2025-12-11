import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { Users } from './entities/users.entity';
import { Typeofdocuments } from 'src/shared/entities/typeofdocuments.entity';
import { States } from 'src/shared/entities/states.entity';
import { Roles } from 'src/roles/entities/roles.entity';
import { Technicians } from 'src/technicians/entities/technicians.entity';
import { Customers } from 'src/customers/entities/customers.entity';
import { TechnicianTypeMap } from 'src/shared/entities/technician-type-map.entity';
import { Techniciantypes } from 'src/technicians/entities/technician_types.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Users, Typeofdocuments, States, Roles, Technicians, Customers, TechnicianTypeMap, Techniciantypes])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [TypeOrmModule, UsersService],
})
export class UsersModule {}
