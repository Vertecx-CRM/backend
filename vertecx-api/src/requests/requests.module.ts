import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RequestsController } from "./requests.controller";
import { RequestsService } from "./requests.service";
import { ServiceRequest } from "./entities/servicerequest.entity";
import { ServiceRequestTechnician } from "./entities/servicerequest-technician.entity";
import { Services } from "src/services/entities/services.entity";
import { States } from "src/shared/entities/states.entity";
import { CustomersModule } from "src/customers/customers.module";
import { Customers } from "src/customers/entities/customers.entity";


@Module({
  imports: [
    TypeOrmModule.forFeature([
      ServiceRequest,
      ServiceRequestTechnician,
      Services,
      States,
      Customers
    ]),
    CustomersModule,
  ],
  controllers: [RequestsController],
  providers: [RequestsService],
  exports: [RequestsService],
})
export class RequestsModule {}
