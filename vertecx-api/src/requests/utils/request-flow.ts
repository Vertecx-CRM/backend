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

export function normalizeRequestMode(value?: string | null) {
  const normalized = String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

  if (!normalized) return "";
  if (normalized.includes("direct")) return "DIRECT_INSTALLATION";
  if (normalized.includes("asesor")) return "ASSESSMENT";
  return normalized.toUpperCase();
}

export function isDirectInstallationRequest(value?: string | null) {
  return normalizeRequestMode(value) === "DIRECT_INSTALLATION";
}

export function getRequestScheduleContextLabel(
  serviceType?: string | null,
  requestMode?: string | null
) {
  if (isInstallationRequestFlow(serviceType) && !isDirectInstallationRequest(requestMode)) {
    return "asesoria tecnica previa a instalacion";
  }

  if (isInstallationRequestFlow(serviceType) && isDirectInstallationRequest(requestMode)) {
    return "instalacion programada";
  }

  return "solicitud de servicio";
}
