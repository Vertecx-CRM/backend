import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from './entities/users.entity';
import { Typeofdocuments } from 'src/shared/entities/typeofdocuments.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Users, Typeofdocuments])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [TypeOrmModule],
})
export class UsersModule {}
