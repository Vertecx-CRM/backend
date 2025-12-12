// customers/customers.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { Customers } from './entities/customers.entity'; // ← Customers
import { Users } from 'src/users/entities/users.entity';
import { Roles } from 'src/roles/entities/roles.entity';
import { States } from 'src/shared/entities/states.entity';
import { Typeofdocuments } from 'src/shared/entities/typeofdocuments.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Customers,
      Users,
      Roles,
      States,
      Typeofdocuments,
    ]),
  ],
  controllers: [CustomersController],
  providers: [CustomersService],
  exports: [CustomersService],
})
export class CustomersModule {}