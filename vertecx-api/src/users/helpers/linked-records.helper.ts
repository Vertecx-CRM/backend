import { EntityManager } from 'typeorm';

export async function hasUserLinkedRecords(
  manager: EntityManager,
  customerIds: number[],
  technicianIds: number[],
  getOrdersTechnicianColumn: () => Promise<string | null>,
  existsByIds: (table: string, column: string, ids: number[]) => Promise<boolean>,
  existsQuotesByOrders: (field: string, ids: number[]) => Promise<boolean>,
): Promise<boolean> {

  if (customerIds.length > 0) {
    if (await existsByIds('sales', 'customerid', customerIds)) return true;
    if (await existsByIds('servicerequests', 'clientid', customerIds)) return true;
    if (await existsByIds('ordersservices', 'clientid', customerIds)) return true;
    if (await existsQuotesByOrders('clientid', customerIds)) return true;
  }

  if (technicianIds.length > 0) {
    const techColumn = await getOrdersTechnicianColumn();
    if (techColumn) {
      if (await existsByIds('ordersservices', techColumn, technicianIds)) return true;
      if (await existsQuotesByOrders(techColumn, technicianIds)) return true;
    }
  }

  return false;
}
