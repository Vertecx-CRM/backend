import { UpdateUserDto } from '../dto/update-user.dto';

export function buildUpdateNotificationHTML(dto: UpdateUserDto) {
  const labels: Record<string, string> = {
    name: 'Nombre',
    lastname: 'Apellido',
    email: 'Correo electrónico',
    phone: 'Teléfono',
    documentnumber: 'Número de documento',
    stateid: 'Estado',
    roleid: 'Rol',
    CV: 'Hoja de vida',
    customercity: 'Ciudad',
    customerzipcode: 'Código postal',
    isNit: '¿Es NIT?',
  };

  return Object.entries(dto)
    .filter(([k]) => !['password', 'updateat'].includes(k))
    .map(([key, value]) => {
      const label = labels[key] ?? key;

      if (value == null || value === '') return `<b>${label}:</b> Sin información`;
      if (typeof value === 'boolean') return `<b>${label}:</b> ${value ? 'Sí' : 'No'}`;
      return `<b>${label}:</b> ${value}`;
    })
    .join('<br/>');
}
