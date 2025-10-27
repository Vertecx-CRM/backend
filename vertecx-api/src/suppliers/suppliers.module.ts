import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Suppliers } from './entities/suppliers.entity';
import { SuppliersService } from './suppliers.service';
import { SuppliersController } from './suppliers.controller';
import { Users } from 'src/users/entities/users.entity';
import { States } from 'src/shared/entities/states.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Suppliers, Users, States])],
  controllers: [SuppliersController],
  providers: [SuppliersService],
  exports: [SuppliersService],
})
export class SuppliersModule {}
