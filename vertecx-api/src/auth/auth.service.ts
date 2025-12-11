import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from 'src/users/entities/users.entity';
import * as bcrypt from 'bcrypt';
import { AccessService } from './access.service';
import { MailService } from 'src/shared/mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    private readonly access: AccessService,
    @InjectRepository(Users) private readonly users: Repository<Users>,
    private readonly mailService: MailService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.users.findOne({
      where: { email },
      relations: ['roles'],
    });

    if (!user || user.stateid !== 1) return null;

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return null;

    const permissions = await this.access.getAccessKeys(user.roleid);

    return {
      userid: user.userid,
      email: user.email,
      name: user.name,
      roleid: user.roleid,
      rolename: user.roles?.name,
      isactive: user.stateid === 1,
      mustchangepassword: user.mustchangepassword,
      permissions: Array.from(permissions),
    };
  }

  private signAccess(payload: any) {
    return this.jwt.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: Number(process.env.JWT_ACCESS_TTL),
    });
  }

  private signRefresh(payload: any) {
    return this.jwt.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: Number(process.env.JWT_REFRESH_TTL),
    });
  }

  private signResetToken(user: Users) {
    const payload = {
      sub: user.userid,
      email: user.email,
      type: 'reset',
    };

    const secret = process.env.JWT_RESET_SECRET || process.env.JWT_ACCESS_SECRET;
    const ttl = Number(process.env.JWT_RESET_TTL || 900);

    return this.jwt.sign(payload, {
      secret,
      expiresIn: ttl,
    });
  }

  async login(userPayload: any) {
    const { exp, iat, ...clean } = userPayload;
    const access_token = this.signAccess(clean);
    const refresh_token = this.signRefresh(clean);
    return { access_token, refresh_token };
  }

  async refresh(userPayload: any) {
    const { exp, iat, ...clean } = userPayload;
    const access_token = this.signAccess(clean);
    const refresh_token = this.signRefresh(clean);
    return { access_token, refresh_token };
  }

  async register(data: {
    email: string;
    name: string;
    lastname: string;
    documentnumber: string;
    phone: string;
    password: string;
    typeid: number;
    stateid: number;
    roleid: number;
  }) {
    const exists = await this.users.findOne({ where: { email: data.email } });
    if (exists) throw new BadRequestException('Email ya registrado');

    const user: Users = this.users.create({
      email: data.email,
      name: data.name,
      lastname: data.lastname,
      documentnumber: data.documentnumber,
      phone: data.phone,
      typeid: data.typeid,
      stateid: data.stateid,
      roleid: data.roleid,
      mustchangepassword: true,
    });

    user.password = await bcrypt.hash(data.password, 12);
    await this.users.save(user);

    const permissions = await this.access.getAccessKeys(user.roleid);

    const payload = {
      userid: user.userid,
      email: user.email,
      name: user.name,
      roleid: user.roleid,
      permissions: Array.from(permissions),
    };

    return this.login(payload);
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.users.findOne({ where: { email } });

    if (!user || user.stateid !== 1) {
      return;
    }

    const token = this.signResetToken(user);
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetLink = `${baseUrl}/auth/reset-password?token=${encodeURIComponent(
      token,
    )}`;

    await this.mailService.sendPasswordReset(user.email, user.name, resetLink);
  }

  // === NUEVO: aplicar nueva contraseña ===
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const secret =
        process.env.JWT_RESET_SECRET || process.env.JWT_ACCESS_SECRET;

      const decoded = this.jwt.verify<{
        sub: number;
        email: string;
        type?: string;
      }>(token, { secret });

      if (decoded.type !== 'reset') {
        throw new BadRequestException('Token inválido');
      }

      const user = await this.users.findOne({
        where: { userid: decoded.sub },
      });

      if (!user || user.stateid !== 1) {
        throw new BadRequestException('Usuario no válido');
      }

      user.password = await bcrypt.hash(newPassword, 12);
      user.updateat = new Date();

      await this.users.save(user);
    } catch (error) {
      throw new BadRequestException(
        'El enlace para restablecer la contraseña no es válido o ha expirado',
      );
    }
  }

  async changePassword(
    userid: number,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.users.findOne({ where: { userid } });
    if (!user) throw new BadRequestException('Usuario no encontrado');

    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok)
      throw new BadRequestException('La contrase�a actual es incorrecta.');

    user.password = await bcrypt.hash(newPassword, 10);
    user.mustchangepassword = false;
    user.updateat = new Date();

    await this.users.save(user);

    return { success: true, message: 'Contrase�a actualizada correctamente.' };
  }
}
