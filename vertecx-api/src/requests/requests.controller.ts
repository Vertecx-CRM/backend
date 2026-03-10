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
import { CreateRequestFromAuthDto } from "./dto/create-request-from-auth.dto";
import { AuthGuard } from "@nestjs/passport";
import { RequestQueryDto } from "./dto/request-query.dto";
import { ApiResponse } from "@nestjs/swagger";

@Controller("service-requests")
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Get("states/all")
  findAllStates() {
    return this.requestsService.findAllStates();
  }

  @UseGuards(AuthGuard("jwt"))
  @Post("from-auth")
  createFromAuth(@Req() { user }: any, @Body() dto: CreateRequestFromAuthDto) {
    return this.requestsService.createFromAuth(user, dto);
  }

  @Post()
  create(@Body() dto: CreateRequestDto) {
    return this.requestsService.create(dto);
  }

  @ApiResponse({ status: 404, description: 'Solicitudes no encontradas, verificar parametros de consulta' })
  @ApiResponse({ status: 200, description: 'Solicitudes encontradas' })
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
