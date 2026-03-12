export function resolveUserIdFromAuth(user: any): number {
  const candidates = [user?.userid, user?.id, user?.sub];
  for (const c of candidates) {
    const n = Number(c);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return 0;
}
