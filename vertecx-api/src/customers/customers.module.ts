import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { Customers } from './entities/customers.entity';
import { UsersModule } from 'src/users/users.module'; // ✅ IMPORT CORRECTO

@Module({
  imports: [
    TypeOrmModule.forFeature([Customers]),
    UsersModule, // ✅ Inyección correcta
  ],
  controllers: [CustomersController],
  providers: [CustomersService],
  exports: [CustomersService],
})
export class CustomersModule {}