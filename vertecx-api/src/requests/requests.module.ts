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
import { OrdersServices } from "src/orders-services/entities/orders-services.entity";
import { TechniciansModule } from "../technicians/technicians.module";
import { Technicians } from "../technicians/entities/technicians.entity";
import { TechnicianTypeMap } from "../shared/entities/technician-type-map.entity";
import { UsersModule } from "../users/users.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TechnicianTypeMap,
      Technicians,
      ServiceRequest,
      ServiceRequestTechnician,
      Services,
      States,
      Customers,
      OrdersServices,
    ]),
    UsersModule,
    TechniciansModule,
    CustomersModule,
  ],
  controllers: [RequestsController],
  providers: [RequestsService],
  exports: [RequestsService],
})
export class RequestsModule {}
