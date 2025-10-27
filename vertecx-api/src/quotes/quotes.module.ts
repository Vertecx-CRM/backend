import { Module } from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { QuotesController } from './quotes.controller';
import { Quotes } from './entities/quotes.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ordersservices } from 'src/services/entities/ordersservices.entity';
import { States } from 'src/shared/entities/states.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Quotes, Ordersservices, States])],
  controllers: [QuotesController],
  providers: [QuotesService],
  exports: [QuotesService],
})
export class QuotesModule {}
