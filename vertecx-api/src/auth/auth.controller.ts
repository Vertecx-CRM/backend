import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshGuard } from './guards/refresh.guard';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @HttpCode(200)
  @UseGuards(AuthGuard('local'))
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'vertecx563@gmail.com' },
        password: { type: 'string', example: 'Joaoestid@1234' },
      },
      required: ['email', 'password'],
    },
  })
  @Post('login')
  async login(@Req() req: any) {
    return this.auth.login(req.user);
  }

  @UseGuards(RefreshGuard)
  @Get('refresh')
  refresh(@Req() req: any) {
    return this.auth.refresh(req.user);
  }

  @Post('register')
  async register(@Body() dto: any) {
    return this.auth.register(dto);
  }


  @Post('forgot-password')
  @HttpCode(200)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.auth.requestPasswordReset(dto.email);
    return {
      message:
        'Si el correo existe en nuestro sistema, te hemos enviado un enlace para restablecer tu contraseña.',
    };
  }


  @Post('reset-password')
  @HttpCode(200)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.auth.resetPassword(dto.token, dto.password);
    return {
      message: 'Contraseña actualizada correctamente',
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('me')
  me(@Req() req: any) {
    return req.user;
  }
}
