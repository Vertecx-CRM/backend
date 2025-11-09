import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { Users } from './entities/users.entity';
import { Typeofdocuments } from 'src/shared/entities/typeofdocuments.entity';
import { States } from 'src/shared/entities/states.entity';
import { Roleconfiguration } from 'src/roles/entities/roleconfiguration.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Users, Typeofdocuments, States, Roleconfiguration])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [TypeOrmModule, UsersService],
})
export class UsersModule {}
