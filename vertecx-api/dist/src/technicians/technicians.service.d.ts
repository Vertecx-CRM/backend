import { CreateTechnicianDto } from './dto/create-technician.dto';
import { UpdateTechnicianDto } from './dto/update-technician.dto';
export declare class TechniciansService {
    create(createTechnicianDto: CreateTechnicianDto): string;
    findAll(): string;
    findOne(id: number): string;
    update(id: number, updateTechnicianDto: UpdateTechnicianDto): string;
    remove(id: number): string;
}
