export class NormalizationClass {
  static normalizeTechnicians(input: any): number[] {
    const raw = Array.isArray(input) ? input : [];
    const flat = raw.flatMap((x: any) => (Array.isArray(x) ? x : [x]));
    const ids = flat
      .map((t: any) => Number(t))
      .filter((n: number) => Number.isFinite(n) && n > 0);
    return Array.from(new Set(ids));
  }

  static normalizeStateName(name?: string | null) {
    return (name ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }
}
