import { Module } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { SuppliersController } from './suppliers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Suppliers } from './entities/suppliers.entity';
import { Users } from 'src/users/entities/users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Suppliers, Users])],

  controllers: [SuppliersController],
  providers: [SuppliersService],
})
export class SuppliersModule {}
