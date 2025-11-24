import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from 'src/users/entities/users.entity';
import * as bcrypt from 'bcrypt';
import { AccessService } from './access.service';

@Injectable()
export class AuthService {
  constructor(
    private jwt: JwtService,
    private access: AccessService,
    @InjectRepository(Users) private users: Repository<Users>,
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
}
