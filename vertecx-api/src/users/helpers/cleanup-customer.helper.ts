import { EntityManager } from 'typeorm';
import { Customers } from 'src/customers/entities/customers.entity';

export async function cleanupCustomer(
  manager: EntityManager,
  customer: Customers,
) {
  const customerRepo = manager.getRepository(Customers);
  await customerRepo.remove(customer);
}
