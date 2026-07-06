import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Patch,
  Delete,
  Req,
  UseGuards,
  Query,
} from "@nestjs/common";
import { RequestsService } from "./requests.service";
import { CreateRequestDto } from "./dto/create-request.dto";
import { UpdateServiceRequestDto } from "./dto/update-request.dto";
import { AuthGuard } from "@nestjs/passport";
import { RequestQueryDto } from "./dto/request-query.dto";
import { ApiResponse } from "@nestjs/swagger";
import { CreateAdminRequestDto } from "./dto/create-admin-request-.dto";

@Controller("service-requests")
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Get("states/all")
  findAllStates() {
    return this.requestsService.findAllStates();
  }

  @UseGuards(AuthGuard("jwt"))
  @Post()
  create(@Req() { user }: any, @Body() dto: CreateRequestDto) {
    return this.requestsService.create(user, dto);
  }

  @Post("admin")
  createByAdmin(@Body() dto: CreateAdminRequestDto) {
    return this.requestsService.createByAdmin(dto);
  }

  @ApiResponse({ status: 200, description: 'Solicitudes encontradas o lista vacia' })
  @Get()
  findAll(@Query() query: RequestQueryDto) {
    return this.requestsService.findAll(query);
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.requestsService.findOne(id);
  }

  @Patch(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateServiceRequestDto
  ) {
    return this.requestsService.update(id, dto);
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.requestsService.remove(id);
  }
}
