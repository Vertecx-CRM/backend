export class UpdateProductsCategoryDto {
  icon?: string;
  name?: string;
  description?: string;
  status?: boolean;

  constructor(data: any) {
    this.icon = data.icon;
    this.name = data.name?.trim();
    this.description = data.description?.trim();
    this.status = data.status;
  }

  validate(): string[] {
    const errors: string[] = [];
    const hasNumbers = /\d/;

    // Validar nombre solo si viene
    if (this.name) {
      if (typeof this.name !== 'string') {
        errors.push('El nombre debe ser un texto.');
      } else if (this.name.length < 3) {
        errors.push('El nombre debe tener al menos 3 caracteres.');
      } else if (this.name.length > 50) {
        errors.push('El nombre no debe superar los 50 caracteres.');
      } else if (hasNumbers.test(this.name)) {
        errors.push('El nombre no puede contener valores numéricos.');
      }
    }

    // Validar descripción solo si viene
    if (this.description) {
      if (typeof this.description !== 'string') {
        errors.push('La descripción debe ser un texto.');
      } else if (this.description.length > 255) {
        errors.push('La descripción no debe superar los 255 caracteres.');
      } else if (hasNumbers.test(this.description)) {
        errors.push('La descripción no puede contener valores numéricos.');
      }
    }

    // Validar icono solo si viene
    if (this.icon && typeof this.icon !== 'string') {
      errors.push('El icono debe ser una cadena de texto (URL o base64).');
    }

    // Validar estado solo si viene
    if (this.status !== undefined && typeof this.status !== 'boolean') {
      errors.push('El estado debe ser un valor booleano (true o false).');
    }

    return errors;
  }
}
