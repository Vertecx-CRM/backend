import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestsController } from './requests.controller';
import { RequestsService } from './requests.service';
import { ServiceRequest } from './entities/servicerequest.entity';
import { Customers } from 'src/customers/entities/customers.entity';
import { Services } from 'src/services/entities/services.entity';
import { States } from 'src/shared/entities/states.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceRequest, Customers, Services, States])],
  controllers: [RequestsController],
  providers: [RequestsService],
  exports: [RequestsService],
})
export class RequestsModule {}
