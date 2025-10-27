import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { Quotes } from './entities/quotes.entity';
import { Repository } from 'typeorm';
export declare class QuotesService {
    private readonly quotesRepo;
    constructor(quotesRepo: Repository<Quotes>);
    create(createQuoteDto: CreateQuoteDto): string;
    findAll(): string;
    findOne(id: number): string;
    update(id: number, updateQuoteDto: UpdateQuoteDto): string;
    remove(id: number): string;
}
