import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SalesModule } from 'src/sales/sales.module';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

@Module({
  imports: [ConfigModule, SalesModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
