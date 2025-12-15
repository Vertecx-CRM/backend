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
} from "@nestjs/common";
import { RequestsService } from "./requests.service";
import { CreateRequestDto } from "./dto/create-request.dto";
import { UpdateServiceRequestDto } from "./dto/update-request.dto";
import { CreateRequestFromAuthDto } from "./dto/create-request-from-auth.dto";
import { AuthGuard } from "@nestjs/passport";

@Controller("service-requests")
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Get("states/all")
  findAllStates() {
    return this.requestsService.findAllStates();
  }

  @UseGuards(AuthGuard("jwt"))
  @Post("from-auth")
  createFromAuth(@Req() req: any, @Body() dto: CreateRequestFromAuthDto) {
    return this.requestsService.createFromAuth(req.user, dto);
  }

  @Post()
  create(@Body() dto: CreateRequestDto) {
    return this.requestsService.create(dto);
  }

  @Get()
  findAll() {
    return this.requestsService.findAll();
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
