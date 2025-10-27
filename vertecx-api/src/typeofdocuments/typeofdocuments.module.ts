import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeofdocumentsService } from './typeofdocuments.service';
import { TypeofdocumentsController } from './typeofdocuments.controller';
import { Typeofdocuments } from 'src/shared/entities/typeofdocuments.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Typeofdocuments])],
  providers: [TypeofdocumentsService],
  controllers: [TypeofdocumentsController],
  exports: [TypeofdocumentsService],
})
export class TypeofdocumentsModule {}
