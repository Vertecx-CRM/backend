import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Roleconfiguration } from 'src/roles/entities/roleconfiguration.entity';

@Injectable()
export class AccessService {
  constructor(
    @InjectRepository(Roleconfiguration)
    private repo: Repository<Roleconfiguration>,
  ) {}

  async getAccessKeys(roleid: number): Promise<Set<string>> {
    if (!roleid) return new Set();

    const rows = await this.repo.find({
      where: { roleid },
      relations: ['permissions', 'privileges'],
    });

    const permissions = new Set<string>();

    for (const r of rows) {
      const module = r.permissions?.module;
      const priv = r.privileges?.name;
      if (module && priv) {
        permissions.add(`${module}.${priv}`);
      }
    }

    return permissions;
  }
}
