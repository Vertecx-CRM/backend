import { SetMetadata } from '@nestjs/common';

export const PERMS_KEY = 'perms_required';
export const PermissionsRequired = (...perms: string[]) =>
  SetMetadata(PERMS_KEY, perms);
