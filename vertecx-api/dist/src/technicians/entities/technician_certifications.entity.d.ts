import { Technicians } from './technicians.entity';
import { Certifications } from 'src/shared/entities/certifications.entity';
import { States } from 'src/shared/entities/states.entity';
export declare class TechnicianCertifications {
    technician_certification_id: number;
    technicianid: number;
    certificationid: number;
    uploaded_at: string;
    stateid: number;
    file_path: string;
    technicians: Technicians;
    certifications: Certifications;
    states: States;
}
