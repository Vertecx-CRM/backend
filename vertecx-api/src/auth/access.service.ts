import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Roleconfiguration } from 'src/roles/entities/roleconfiguration.entity';

@Injectable()
export class AccessService {
  private readonly logger = new Logger(AccessService.name);

  constructor(
    @InjectRepository(Roleconfiguration)
    private repo: Repository<Roleconfiguration>,
  ) {}

  async getAccessKeys(roleid: number): Promise<Set<string>> {
    if (!roleid) return new Set();

    let rows: Roleconfiguration[];
    try {
      rows = await this.repo.find({
        where: { roleid },
        relations: ['permissions', 'privileges'],
      });
    } catch (error) {
      this.logger.error(
        `LOGIN_ACCESS_QUERY_ERROR roleid=${roleid}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }

    const permissions = new Set<string>();

    for (const r of rows) {
      const module = r.permissions?.module;
      const priv = r.privileges?.name;
      if (module && priv) {
        permissions.add(`${module}.${priv}`);
      }
    }

    this.logger.log(
      `LOGIN_ACCESS_OK roleid=${roleid} rows=${rows.length} permissions=${permissions.size}`,
    );

    return permissions;
  }
}
