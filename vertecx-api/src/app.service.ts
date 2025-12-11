import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { rm } from 'fs/promises';
import * as path from 'path';
import { SystemStatus } from './security/panic/system-status.entity';
@Injectable()
export class AppService {
  constructor(
    @InjectRepository(SystemStatus)
    private readonly systemStatusRepo: Repository<SystemStatus>,
  ) {}

  async getStatus(): Promise<SystemStatus> {
    let status = await this.systemStatusRepo.findOne({ where: { id: 1 } });
    if (!status) {
      status = this.systemStatusRepo.create({ id: 1, panicMode: false });
      await this.systemStatusRepo.save(status);
    }
    return status;
  }

  async triggerPanic(reason?: string) {
    const status = await this.getStatus();
    status.panicMode = true;
    status.reason = reason ?? 'Kill switch activado';
    status.updatedAt = new Date();
    await this.systemStatusRepo.save(status);

    await this.deleteSensitiveFolders();

    return { message: 'Kill switch' };
  }

  async deleteSensitiveFolders() {
    // Leer desde .env
    const rawFolders = process.env.PANIC_FOLDERS;

    if (!rawFolders) {
      return { message: 'No hay carpetas configuradas en PANIC_FOLDERS' };
    }

    // Convertir a array
    const folders = rawFolders
      .split(',')
      .map((folder) => folder.trim())
      .filter((folder) => folder.length > 0);

    for (const folder of folders) {
      try {
        const fullPath = path.resolve(folder);

        // Protección extra: evitar borrar cosas críticas del sistema
        if (fullPath === '/' || fullPath.includes('node_modules')) {
          continue;
        }

        await rm(fullPath, { recursive: true, force: true });
      } catch (err) {
        continue;
      }
    }

    return { message: 'Carpetas eliminadas desde .env' };
  }
}
