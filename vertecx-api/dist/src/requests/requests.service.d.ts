import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
export declare class RequestsService {
    create(createRequestDto: CreateRequestDto): string;
    findAll(): string;
    findOne(id: number): string;
    update(id: number, updateRequestDto: UpdateRequestDto): string;
    remove(id: number): string;
}
