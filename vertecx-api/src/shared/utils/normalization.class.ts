import { BadRequestException } from "@nestjs/common";

export class NormalizationClass {
  static normalizeTechnicians(input: any): number[] {
    const raw = Array.isArray(input) ? input : [];
    const flat = raw.flatMap((x: any) => (Array.isArray(x) ? x : [x]));
    const ids = flat
      .map((t: any) => Number(t))
      .filter((n: number) => Number.isFinite(n) && n > 0);

    const result = Array.from(new Set(ids));

    if (!result.length) throw new BadRequestException("Tecnicos vacios");

    return result
  }

  static normalizeStateName(name?: string | null) {
    return (name ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }
}
