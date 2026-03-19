import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Techniciantypes } from '../entities/technician_types.entity';

const DEFAULT_TECHNICIAN_TYPE_NAMES = [
  'Instalacion CCTV',
  'Mantenimiento CCTV',
  'Cableado estructurado',
  'Redes y configuracion',
  'Soporte electrico',
  'Control de acceso',
  'Alarmas y sensores',
  'Mantenimiento preventivo',
  'Mantenimiento correctivo',
];

@Injectable()
export class TechniciantypesService {
  constructor(
    @InjectRepository(Techniciantypes)
    private readonly techniciantypesRepo: Repository<Techniciantypes>,
  ) {}

  async findAll() {
    await this.ensureDefaultTypes();

    return this.techniciantypesRepo.find({
      where: { stateid: 1 },
      order: { name: 'ASC' },
    });
  }

  private async ensureDefaultTypes() {
    const existing = await this.techniciantypesRepo.find({
      select: ['techniciantypeid', 'name', 'stateid'],
    });

    const normalizedExisting = new Set(
      existing.map((item) =>
        String(item.name ?? '')
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .trim()
          .toLowerCase(),
      ),
    );

    const missing = DEFAULT_TECHNICIAN_TYPE_NAMES.filter((name) => {
      const normalized = name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toLowerCase();
      return !normalizedExisting.has(normalized);
    });

    if (!missing.length) return;

    await this.techniciantypesRepo.save(
      missing.map((name) =>
        this.techniciantypesRepo.create({
          name,
          stateid: 1,
        }),
      ),
    );
  }
}
