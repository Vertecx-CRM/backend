import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
import { Services } from './entities/services.entity';
import { Typeofservices } from './entities/typeofservices.entity';
import { States } from './entities/states.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Services, Typeofservices, States])],
  controllers: [ServicesController],
  providers: [ServicesService],
  exports: [ServicesService],
})
export class ServicesModule {}
