export function normalizeRequestServiceType(value?: string | null) {
  const normalized = String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

  if (normalized.includes("instal")) return "INSTALACION";
  if (normalized.includes("manten")) return "MANTENIMIENTO";
  return String(value ?? "").trim().toUpperCase();
}

export function isInstallationRequestFlow(value?: string | null) {
  return normalizeRequestServiceType(value) === "INSTALACION";
}

export function getRequestScheduleContextLabel(value?: string | null) {
  if (isInstallationRequestFlow(value)) {
    return "asesoria tecnica previa a instalacion";
  }

  return "solicitud de servicio";
}
