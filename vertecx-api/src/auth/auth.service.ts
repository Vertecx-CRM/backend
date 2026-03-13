import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from 'src/users/entities/users.entity';
import * as bcrypt from 'bcrypt';
import { AccessService } from './access.service';
import { MailService } from 'src/shared/mail/mail.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwt: JwtService,
    private readonly access: AccessService,
    @InjectRepository(Users) private readonly users: Repository<Users>,
    private readonly mailService: MailService,
  ) {}

  async validateUser(email: string, password: string) {
    this.logger.log(`LOGIN_VALIDATE_START email=${email}`);

    try {
      const user = await this.users.findOne({
        where: { email },
        select: {
          userid: true,
          email: true,
          password: true,
          name: true,
          roleid: true,
          stateid: true,
          mustchangepassword: true,
        },
        relations: ['roles'],
      });

      if (!user) {
        this.logger.warn(`LOGIN_USER_NOT_FOUND email=${email}`);
        return null;
      }

      if (user.stateid !== 1) {
        this.logger.warn(
          `LOGIN_USER_INACTIVE email=${email} userid=${user.userid} stateid=${user.stateid}`,
        );
        return null;
      }

      if (password == null) {
        this.logger.warn(`LOGIN_PASSWORD_MISSING email=${email}`);
        return null;
      }

      if (!user.password?.trim()) {
        this.logger.error(
          `LOGIN_PASSWORD_HASH_MISSING email=${email} userid=${user.userid}`,
        );
        return null;
      }

      const ok = await bcrypt.compare(password, user.password);
      if (!ok) {
        this.logger.warn(`LOGIN_PASSWORD_MISMATCH email=${email} userid=${user.userid}`);
        return null;
      }

      this.logger.log(`LOGIN_PASSWORD_OK email=${email} userid=${user.userid}`);

      const permissions = await this.access.getAccessKeys(user.roleid);

      const payload = {
        userid: user.userid,
        email: user.email,
        name: user.name,
        roleid: user.roleid,
        rolename: user.roles?.name,
        isactive: user.stateid === 1,
        mustchangepassword: user.mustchangepassword,
        permissions: Array.from(permissions),
      };

      this.logger.log(
        `LOGIN_VALIDATE_OK email=${email} userid=${user.userid} roleid=${user.roleid} permissions=${payload.permissions.length}`,
      );

      return payload;
    } catch (error) {
      this.logger.error(
        `LOGIN_VALIDATE_ERROR email=${email}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  private getRequiredEnv(name: string) {
    const value = process.env[name];
    if (!value?.trim()) {
      throw new InternalServerErrorException(
        `Missing required auth configuration: ${name}`,
      );
    }
    return value;
  }

  private getRequiredTtl(name: string) {
    const value = Number(this.getRequiredEnv(name));
    if (!Number.isFinite(value) || value <= 0) {
      throw new InternalServerErrorException(
        `Invalid auth configuration value: ${name}`,
      );
    }
    return value;
  }

  private signAccess(payload: any) {
    return this.jwt.sign(payload, {
      secret: this.getRequiredEnv('JWT_ACCESS_SECRET'),
      expiresIn: this.getRequiredTtl('JWT_ACCESS_TTL'),
    });
  }

  private signRefresh(payload: any) {
    return this.jwt.sign(payload, {
      secret: this.getRequiredEnv('JWT_REFRESH_SECRET'),
      expiresIn: this.getRequiredTtl('JWT_REFRESH_TTL'),
    });
  }

  private signResetToken(user: Users) {
    const payload = {
      sub: user.userid,
      email: user.email,
      type: 'reset',
    };

    const secret =
      process.env.JWT_RESET_SECRET || process.env.JWT_ACCESS_SECRET;
    const ttl = Number(process.env.JWT_RESET_TTL || 900);

    return this.jwt.sign(payload, {
      secret,
      expiresIn: ttl,
    });
  }

  private issueTokensFromPayload(userPayload: any) {
    const { exp, iat, ...clean } = userPayload;
    const access_token = this.signAccess(clean);
    const refresh_token = this.signRefresh(clean);
    this.logger.log(
      `LOGIN_TOKENS_OK userid=${clean.userid ?? 'unknown'} roleid=${clean.roleid ?? 'unknown'}`,
    );
    return { access_token, refresh_token };
  }

  async login(userPayload: any) {
    try {
      this.logger.log(
        `LOGIN_ISSUE_START userid=${userPayload?.userid ?? 'unknown'} roleid=${userPayload?.roleid ?? 'unknown'}`,
      );
      return this.issueTokensFromPayload(userPayload);
    } catch (error) {
      this.logger.error(
        `LOGIN_ISSUE_ERROR userid=${userPayload?.userid ?? 'unknown'}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  async refresh(userPayload: any) {
    const userid = userPayload?.userid;
    if (!userid) throw new BadRequestException('Token inválido');

    const user = await this.users.findOne({
      where: { userid },
      relations: ['roles'],
    });

    if (!user || user.stateid !== 1) {
      throw new BadRequestException('Usuario no válido');
    }

    const permissions = await this.access.getAccessKeys(user.roleid);

    const clean = {
      userid: user.userid,
      email: user.email,
      name: user.name,
      roleid: user.roleid,
      rolename: user.roles?.name,
      isactive: user.stateid === 1,
      mustchangepassword: user.mustchangepassword,
      permissions: Array.from(permissions),
    };

    return this.issueTokensFromPayload(clean);
  }

  async refreshByToken(refreshToken: string) {
    if (!refreshToken)
      throw new UnauthorizedException('Refresh token requerido');

    let decoded: any;
    try {
      decoded = this.jwt.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }

    const userid = decoded?.userid ?? decoded?.sub;
    if (!userid) throw new UnauthorizedException('Refresh token inválido');

    return this.refresh({ userid });
  }
  async register(data: {
    email: string;
    name: string;
    lastname: string;
    documentnumber: string;
    phone: string;
    password?: string; // opcional
    typeid: number;
    stateid: number;
    roleid: number;
  }) {
    // Verificar si ya existe el email
    const exists = await this.users.findOne({ where: { email: data.email } });
    if (exists) {
      throw new BadRequestException('Email ya registrado');
    }

    // Crear entidad usuario
    const user: Users = this.users.create({
      email: data.email,
      name: data.name,
      lastname: data.lastname,
      documentnumber: data.documentnumber,
      phone: data.phone,
      typeid: data.typeid,
      stateid: data.stateid,
      roleid: data.roleid,
      mustchangepassword: true, // obligar a crear contraseña real
    });

    // Si no llega password, generar uno temporal seguro
    const tempPassword =
      data.password?.trim() || `${Math.random().toString(36).slice(2, 10)}A1!`;

    user.password = await bcrypt.hash(tempPassword, 12);

    await this.users.save(user);

    // Enviar correo para que el usuario cree su contraseña
    await this.requestPasswordReset(user.email);

    // Respuesta limpia (sin login automático)
    return {
      ok: true,
      message:
        'Usuario creado correctamente. Revisa tu correo para establecer tu contraseña.',
    };
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.users.findOne({ where: { email } });

    if (!user || user.stateid !== 1) {
      return;
    }

    const token = this.signResetToken(user);
    const baseUrl = process.env.FRONTEND_URL || 'vertecx-frontend-ftetddefakf8egc2.canadacentral-01.azurewebsites.net';
    const resetLink = `${baseUrl}/auth/reset-password?token=${encodeURIComponent(token)}`;

    await this.mailService.sendPasswordReset(user.email, user.name, resetLink);
  }

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
    } catch {
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
      throw new BadRequestException('La contraseña actual es incorrecta.');

    user.password = await bcrypt.hash(newPassword, 10);
    user.mustchangepassword = false;
    user.updateat = new Date();

    await this.users.save(user);

    return { success: true, message: 'Contraseña actualizada correctamente.' };
  }
}
