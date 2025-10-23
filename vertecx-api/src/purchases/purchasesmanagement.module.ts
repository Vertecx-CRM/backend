import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchasesmanagementService } from './purchasesmanagement.service';
import { PurchasesmanagementController } from './purchasesmanagement.controller';
import { Purchasesmanagement } from './entities/purchasesmanagement.entity';
import { States } from 'src/shared/entities/states.entity';
import { Suppliers } from 'src/shared/entities/suppliers.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Purchasesmanagement, States, Suppliers])],
  controllers: [PurchasesmanagementController],
  providers: [PurchasesmanagementService],
})
export class PurchasesmanagementModule {}
