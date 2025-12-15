import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from "typeorm";
import { Customers } from "src/customers/entities/customers.entity";
import { Services } from "src/services/entities/services.entity";
import { States } from "src/shared/entities/states.entity";
import { ServiceRequestTechnician } from "./servicerequest-technician.entity";

@Entity({ name: "servicerequests" })
@Index(["stateId", "scheduledAt"])
export class ServiceRequest {
  @PrimaryGeneratedColumn({ name: "servicerequestid", type: "int" })
  serviceRequestId: number;

  @Column({ name: "scheduledat", type: "timestamptz", nullable: true })
  scheduledAt: Date | null;

  @Column({ name: "scheduledendat", type: "timestamptz", nullable: true })
  scheduledEndAt: Date | null;

  @Column({ name: "servicetype", type: "varchar", length: 50 })
  serviceType: string;

  @Column({ name: "direccion", type: "varchar", length: 255 })
  direccion: string;

  @Column({ name: "description", type: "text" })
  description: string;

  @CreateDateColumn({ name: "createdat", type: "timestamptz" })
  createdAt: Date;

  @Column({ name: "stateid", type: "int" })
  stateId: number;

  @ManyToOne(() => States, { eager: false })
  @JoinColumn({ name: "stateid" })
  state: States;

  @Column({ name: "serviceid", type: "int" })
  serviceId: number;

  @ManyToOne(() => Services, { eager: false })
  @JoinColumn({ name: "serviceid" })
  service: Services;

  @Column({ name: "clientid", type: "int" })
  clientId: number;

  @ManyToOne(() => Customers, { eager: false })
  @JoinColumn({ name: "clientid" })
  customer: Customers;

  @OneToMany(() => ServiceRequestTechnician, (x) => x.serviceRequest, {
    cascade: false,
  })
  techniciansMap: ServiceRequestTechnician[];
}
