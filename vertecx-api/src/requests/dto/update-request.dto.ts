import { PartialType } from "@nestjs/mapped-types";
import { CreateAdminRequestDto } from "./create-admin-request-.dto";

export class UpdateServiceRequestDto extends PartialType(CreateAdminRequestDto) {}
