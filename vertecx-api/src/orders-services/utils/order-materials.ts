export type OrderInventoryCategoryScope = "sellable" | "service_material" | "tool";
export type OrderProductAvailability = "DISPONIBLE" | "SOLICITAR";

export type OrderProductPlanInput = {
  requestedQuantity: number;
  stock: number;
  scope: OrderInventoryCategoryScope;
  manualEntry?: boolean;
  forcedAvailability?: OrderProductAvailability | null;
};

export type OrderProductPlan = {
  requestedQuantity: number;
  stockCoveredQuantity: number;
  backorderQuantity: number;
  availability: OrderProductAvailability;
};

export function normalizeInventoryCategoryText(value: unknown) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

export function getOrderInventoryCategoryScope(
  categoryName?: string | null
): OrderInventoryCategoryScope {
  const normalized = normalizeInventoryCategoryText(categoryName);

  if (!normalized) return "sellable";
  if (normalized.includes("herramient")) return "tool";
  if (
    (normalized.includes("material") && normalized.includes("servicio")) ||
    normalized.includes("inventario tecnico")
  ) {
    return "service_material";
  }
  return "sellable";
}

export function isOrderBackorderAllowed(scope?: OrderInventoryCategoryScope | null) {
  return scope === "service_material" || scope === "tool";
}

export function computeOrderProductPlan(
  input: OrderProductPlanInput
): OrderProductPlan {
  const requestedQuantity = Math.max(1, Math.round(Number(input.requestedQuantity || 0)));
  const stock = Math.max(0, Math.round(Number(input.stock || 0)));
  const scope = input.scope ?? "sellable";
  const manualEntry = !!input.manualEntry;
  const allowsBackorder = isOrderBackorderAllowed(scope);

  if (!allowsBackorder) {
    return {
      requestedQuantity,
      stockCoveredQuantity: requestedQuantity,
      backorderQuantity: 0,
      availability: "DISPONIBLE",
    };
  }

  const stockCoveredQuantity = manualEntry ? 0 : Math.min(requestedQuantity, stock);
  const backorderQuantity = Math.max(0, requestedQuantity - stockCoveredQuantity);
  const availability =
    input.forcedAvailability === "SOLICITAR" || manualEntry || backorderQuantity > 0
      ? "SOLICITAR"
      : "DISPONIBLE";

  return {
    requestedQuantity,
    stockCoveredQuantity,
    backorderQuantity,
    availability,
  };
}
