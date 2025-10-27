import { CreateAppoimentDto } from './dto/create-appoiment.dto';
import { UpdateAppoimentDto } from './dto/update-appoiment.dto';
export declare class AppoimentsService {
    create(createAppoimentDto: CreateAppoimentDto): string;
    findAll(): string;
    findOne(id: number): string;
    update(id: number, updateAppoimentDto: UpdateAppoimentDto): string;
    remove(id: number): string;
}
