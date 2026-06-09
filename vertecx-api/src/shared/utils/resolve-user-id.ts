import { BadRequestException } from "@nestjs/common";

export function resolveUserIdFromAuth(user: any): number {
  const candidates = [user?.userid, user?.id, user?.sub];
  for (const c of candidates) {
    const n = Number(c);
    if (Number.isFinite(n) && n > 0) return n;
  }
  throw new BadRequestException("Token invalido: no se pudo obtener el userid");
}
