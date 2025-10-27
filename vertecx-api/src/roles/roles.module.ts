import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Roles } from './entities/roles.entity';
import { Permissions } from 'src/shared/entities/permissions.entity';
import { Privileges } from 'src/shared/entities/privileges.entity';
import { Roleconfiguration } from './entities/roleconfiguration.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Roleconfiguration,
      Roles,
      Permissions,
      Privileges,
    ]),
  ],
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService],
})
export class RolesModule {}
