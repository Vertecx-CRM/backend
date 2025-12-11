import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from 'src/users/entities/users.entity';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshJwtStrategy } from './strategies/refresh.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshGuard } from './guards/refresh.guard';
import { AccessService } from './access.service';
import { Roleconfiguration } from 'src/roles/entities/roleconfiguration.entity';
import { MailService } from 'src/shared/mail/mail.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Users, Roleconfiguration]),
    JwtModule.register({}),
  ],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    RefreshJwtStrategy,
    JwtAuthGuard,
    RefreshGuard,
    AccessService,
    MailService,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
