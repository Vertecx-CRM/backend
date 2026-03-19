export type RequestAvailabilityOption = {
  date: string;
  startTime: string;
  endTime: string;
};

export type RequestMode = "ASSESSMENT" | "DIRECT_INSTALLATION";
export type TechnicalReviewStatus =
  | "NOT_APPLICABLE"
  | "PENDING_REVIEW"
  | "ASSESSMENT_REQUIRED"
  | "READY_TO_QUOTE";

export type RequestPurchasedMaterial = {
  productId?: number | null;
  name: string;
  quantity: number;
  unitPrice?: number | null;
  source?: string | null;
};

export type RequestSiteChecklist = {
  installationArea?: string | null;
  installationHeight?: string | null;
  estimatedCableMeters?: string | null;
  needsLadder?: "YES" | "NO" | "UNKNOWN" | null;
  hasPowerPoint?: "YES" | "NO" | "UNKNOWN" | null;
  hasInternetPoint?: "YES" | "NO" | "UNKNOWN" | null;
  materialsSummary?: string | null;
  additionalContext?: string | null;
  evidenceNotes?: string | null;
};

export type RequestFlowMetadata = {
  requestMode?: RequestMode;
  technicalReviewStatus?: TechnicalReviewStatus;
  alreadyHasMaterials?: boolean;
  linkedSaleId?: number | null;
  linkedSaleCode?: string | null;
  purchasedMaterials?: RequestPurchasedMaterial[];
  siteChecklist?: RequestSiteChecklist | null;
};

const AVAILABILITY_MARKER_START = "[[VERTECX_REQUEST_AVAILABILITY]]";
const AVAILABILITY_MARKER_END = "[[/VERTECX_REQUEST_AVAILABILITY]]";
const META_MARKER_START = "[[VERTECX_REQUEST_META]]";
const META_MARKER_END = "[[/VERTECX_REQUEST_META]]";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

function normalizeTriState(
  value: unknown
): "YES" | "NO" | "UNKNOWN" | null {
  const normalized = String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

  if (!normalized) return null;
  if (
    normalized === "si" ||
    normalized === "yes" ||
    normalized === "true" ||
    normalized === "1"
  ) {
    return "YES";
  }
  if (
    normalized === "no" ||
    normalized === "false" ||
    normalized === "0"
  ) {
    return "NO";
  }
  return "UNKNOWN";
}

function normalizeRequestMode(value: unknown): RequestMode | undefined {
  const normalized = String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

  if (!normalized) return undefined;
  if (normalized.includes("direct")) return "DIRECT_INSTALLATION";
  if (normalized.includes("asesor")) return "ASSESSMENT";
  return undefined;
}

function normalizeTechnicalReviewStatus(
  value: unknown
): TechnicalReviewStatus | undefined {
  const normalized = String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

  if (!normalized) return undefined;
  if (normalized.includes("not_app") || normalized.includes("no aplica")) {
    return "NOT_APPLICABLE";
  }
  if (normalized.includes("ready") || normalized.includes("lista")) {
    return "READY_TO_QUOTE";
  }
  if (normalized.includes("require") || normalized.includes("asesor")) {
    return "ASSESSMENT_REQUIRED";
  }
  if (normalized.includes("pend") || normalized.includes("review")) {
    return "PENDING_REVIEW";
  }
  return undefined;
}

function trimOrNull(value: unknown) {
  const text = String(value ?? "").trim();
  return text ? text : null;
}

function normalizePurchasedMaterials(
  input: unknown
): RequestPurchasedMaterial[] {
  if (!Array.isArray(input)) return [];

  const normalized = input
    .map((item) => {
      const productId = Number((item as any)?.productId ?? (item as any)?.productid);
      const quantity = Math.max(
        1,
        Math.round(Number((item as any)?.quantity ?? 0) || 0)
      );
      const unitPriceRaw = Number(
        (item as any)?.unitPrice ??
          (item as any)?.unitprice ??
          (item as any)?.price ??
          0
      );
      const name = trimOrNull((item as any)?.name);
      if (!name) return null;

      return {
        ...(Number.isFinite(productId) && productId > 0 ? { productId } : {}),
        name,
        quantity,
        ...(Number.isFinite(unitPriceRaw) && unitPriceRaw >= 0
          ? { unitPrice: unitPriceRaw }
          : {}),
        ...(trimOrNull((item as any)?.source)
          ? { source: trimOrNull((item as any)?.source) }
          : {}),
      } satisfies RequestPurchasedMaterial;
    })
    .filter((item): item is RequestPurchasedMaterial => !!item);

  const unique = new Map<string, RequestPurchasedMaterial>();
  for (const item of normalized) {
    const key = `${item.productId ?? "manual"}|${item.name.toLowerCase()}`;
    if (!unique.has(key)) unique.set(key, item);
  }
  return Array.from(unique.values());
}

function normalizeSiteChecklist(input: unknown): RequestSiteChecklist | null {
  if (!input || typeof input !== "object") return null;

  const normalized: RequestSiteChecklist = {
    installationArea: trimOrNull((input as any)?.installationArea),
    installationHeight: trimOrNull((input as any)?.installationHeight),
    estimatedCableMeters: trimOrNull((input as any)?.estimatedCableMeters),
    needsLadder: normalizeTriState((input as any)?.needsLadder),
    hasPowerPoint: normalizeTriState((input as any)?.hasPowerPoint),
    hasInternetPoint: normalizeTriState((input as any)?.hasInternetPoint),
    materialsSummary: trimOrNull((input as any)?.materialsSummary),
    additionalContext: trimOrNull((input as any)?.additionalContext),
    evidenceNotes: trimOrNull((input as any)?.evidenceNotes),
  };

  const hasContent = Object.values(normalized).some((value) => value != null);
  return hasContent ? normalized : null;
}

export function normalizeRequestFlowMetadata(
  input: unknown
): RequestFlowMetadata | null {
  if (!input || typeof input !== "object") return null;

  const requestMode = normalizeRequestMode((input as any)?.requestMode);
  const technicalReviewStatus = normalizeTechnicalReviewStatus(
    (input as any)?.technicalReviewStatus
  );
  const alreadyHasMaterials =
    typeof (input as any)?.alreadyHasMaterials === "boolean"
      ? Boolean((input as any)?.alreadyHasMaterials)
      : undefined;
  const linkedSaleIdRaw = Number((input as any)?.linkedSaleId);
  const purchasedMaterials = normalizePurchasedMaterials(
    (input as any)?.purchasedMaterials
  );
  const siteChecklist = normalizeSiteChecklist((input as any)?.siteChecklist);

  const normalized: RequestFlowMetadata = {
    ...(requestMode ? { requestMode } : {}),
    ...(technicalReviewStatus ? { technicalReviewStatus } : {}),
    ...(alreadyHasMaterials !== undefined ? { alreadyHasMaterials } : {}),
    ...(Number.isFinite(linkedSaleIdRaw) && linkedSaleIdRaw > 0
      ? { linkedSaleId: linkedSaleIdRaw }
      : {}),
    ...(trimOrNull((input as any)?.linkedSaleCode)
      ? { linkedSaleCode: trimOrNull((input as any)?.linkedSaleCode) }
      : {}),
    ...(purchasedMaterials.length ? { purchasedMaterials } : {}),
    ...(siteChecklist ? { siteChecklist } : {}),
  };

  return Object.keys(normalized).length ? normalized : null;
}

function extractMarkerBlock(
  input: string,
  startMarker: string,
  endMarker: string
) {
  const startIndex = input.indexOf(startMarker);
  const endIndex = input.indexOf(endMarker);

  if (startIndex < 0 || endIndex < 0 || endIndex <= startIndex) {
    return { body: null as string | null, cleanText: input };
  }

  const body = input
    .slice(startIndex + startMarker.length, endIndex)
    .trim();

  const cleanText = `${input.slice(0, startIndex)}${input.slice(
    endIndex + endMarker.length
  )}`
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return { body, cleanText };
}

function isValidDate(value: string) {
  if (!DATE_RE.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isFinite(parsed.getTime());
}

function isValidTime(value: string) {
  return TIME_RE.test(value);
}

function timeToMinutes(value: string) {
  const [hours, minutes] = value.split(":").map((part) => Number(part));
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return NaN;
  return hours * 60 + minutes;
}

export function normalizeRequestAvailabilityOptions(
  input: unknown
): RequestAvailabilityOption[] {
  if (!Array.isArray(input)) return [];

  const unique = new Map<string, RequestAvailabilityOption>();

  for (const item of input) {
    const date = String((item as any)?.date ?? "").trim();
    const startTime = String((item as any)?.startTime ?? "").trim();
    const endTime = String((item as any)?.endTime ?? "").trim();

    if (!isValidDate(date) || !isValidTime(startTime) || !isValidTime(endTime)) continue;
    if (timeToMinutes(endTime) <= timeToMinutes(startTime)) continue;

    const key = `${date}|${startTime}|${endTime}`;
    if (!unique.has(key)) {
      unique.set(key, { date, startTime, endTime });
    }
  }

  return Array.from(unique.values()).sort((a, b) => {
    const left = `${a.date} ${a.startTime}`;
    const right = `${b.date} ${b.startTime}`;
    return left.localeCompare(right);
  });
}

export function parseRequestDescriptionWithAvailability(raw: unknown): {
  descriptionPlain: string;
  availabilityOptions: RequestAvailabilityOption[];
  flowMetadata: RequestFlowMetadata | null;
} {
  const text = String(raw ?? "");
  const availabilityBlock = extractMarkerBlock(
    text,
    AVAILABILITY_MARKER_START,
    AVAILABILITY_MARKER_END
  );
  const metaBlock = extractMarkerBlock(
    availabilityBlock.cleanText,
    META_MARKER_START,
    META_MARKER_END
  );

  const descriptionPlain = metaBlock.cleanText.trim();
  const availabilityPayload = availabilityBlock.body;
  const metaPayload = metaBlock.body;

  try {
    const parsedAvailability = availabilityPayload
      ? JSON.parse(availabilityPayload)
      : [];
    const parsedMeta = metaPayload ? JSON.parse(metaPayload) : null;
    return {
      descriptionPlain,
      availabilityOptions: normalizeRequestAvailabilityOptions(parsedAvailability),
      flowMetadata: normalizeRequestFlowMetadata(parsedMeta),
    };
  } catch {
    return {
      descriptionPlain: descriptionPlain || text.trim(),
      availabilityOptions: [],
      flowMetadata: null,
    };
  }
}

export function composeRequestDescriptionWithAvailability(
  description: string,
  availabilityOptions: unknown,
  flowMetadata?: unknown
): string {
  const plain = String(description ?? "").trim();
  const normalizedOptions = normalizeRequestAvailabilityOptions(availabilityOptions);
  const normalizedMeta = normalizeRequestFlowMetadata(flowMetadata);

  const parts = [plain].filter(Boolean);

  if (normalizedOptions.length) {
    parts.push(
      AVAILABILITY_MARKER_START,
      JSON.stringify(normalizedOptions),
      AVAILABILITY_MARKER_END
    );
  }

  if (normalizedMeta) {
    parts.push(
      META_MARKER_START,
      JSON.stringify(normalizedMeta),
      META_MARKER_END
    );
  }

  return parts.join("\n\n").trim();
}
