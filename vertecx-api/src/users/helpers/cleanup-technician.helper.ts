import { EntityManager } from 'typeorm';
import { Technicians } from 'src/technicians/entities/technicians.entity';
import { TechnicianTypeMap } from 'src/shared/entities/technician-type-map.entity';

export async function cleanupTechnician(
  manager: EntityManager,
  technician: Technicians,
) {
  const mapRepo = manager.getRepository(TechnicianTypeMap);
  const techRepo = manager.getRepository(Technicians);

  await mapRepo.delete({ technicianid: technician.technicianid });
  await techRepo.remove(technician);
}
