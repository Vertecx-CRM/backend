import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ServiceRequest } from './servicerequest.entity';
import { Technicians } from 'src/technicians/entities/technicians.entity';

@Entity({ name: 'servicerequests_technicians' })
@Index(['serviceRequestId', 'technicianId'], { unique: true })
export class ServiceRequestTechnician {
  @PrimaryGeneratedColumn({ name: 'servicerequeststechniciansid', type: 'int' })
  serviceRequestTechniciansId: number;

  @Column({ name: 'servicerequestid', type: 'int' })
  serviceRequestId: number;

  @ManyToOne(() => ServiceRequest, (sr) => sr.techniciansMap, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'servicerequestid' })
  serviceRequest: ServiceRequest;

  @Column({ name: 'technicianid', type: 'int' })
  technicianId: number;

  @ManyToOne(() => Technicians, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'technicianid' })
  technician: Technicians;
}
