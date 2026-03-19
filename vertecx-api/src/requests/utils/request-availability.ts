export type RequestAvailabilityOption = {
  date: string;
  startTime: string;
  endTime: string;
};

const AVAILABILITY_MARKER_START = "[[VERTECX_REQUEST_AVAILABILITY]]";
const AVAILABILITY_MARKER_END = "[[/VERTECX_REQUEST_AVAILABILITY]]";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

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
} {
  const text = String(raw ?? "");
  const startIndex = text.indexOf(AVAILABILITY_MARKER_START);
  const endIndex = text.indexOf(AVAILABILITY_MARKER_END);

  if (startIndex < 0 || endIndex < 0 || endIndex <= startIndex) {
    return {
      descriptionPlain: text.trim(),
      availabilityOptions: [],
    };
  }

  const plain = text.slice(0, startIndex).trim();
  const encoded = text
    .slice(startIndex + AVAILABILITY_MARKER_START.length, endIndex)
    .trim();

  try {
    const parsed = JSON.parse(encoded);
    return {
      descriptionPlain: plain,
      availabilityOptions: normalizeRequestAvailabilityOptions(parsed),
    };
  } catch {
    return {
      descriptionPlain: plain || text.trim(),
      availabilityOptions: [],
    };
  }
}

export function composeRequestDescriptionWithAvailability(
  description: string,
  availabilityOptions: unknown
): string {
  const plain = String(description ?? "").trim();
  const normalizedOptions = normalizeRequestAvailabilityOptions(availabilityOptions);

  if (!normalizedOptions.length) return plain;

  return [
    plain,
    AVAILABILITY_MARKER_START,
    JSON.stringify(normalizedOptions),
    AVAILABILITY_MARKER_END,
  ]
    .filter(Boolean)
    .join("\n\n");
}
