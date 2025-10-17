import { PartialType } from '@nestjs/mapped-types';
import { CreateAppoimentDto } from './create-appoiment.dto';

export class UpdateAppoimentDto extends PartialType(CreateAppoimentDto) {}
