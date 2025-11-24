import { Body, Controller, Get, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshGuard } from './guards/refresh.guard';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';

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
        password: { type: 'string', example: '@TIR6h7R@@' }
      },
      required: ['email', 'password']
    }
  })
  @Post('login')
  async login(@Req() req: any) {
    return this.auth.login(req.user)
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

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('me')
  me(@Req() req: any) {
    return req.user;
  }
}
