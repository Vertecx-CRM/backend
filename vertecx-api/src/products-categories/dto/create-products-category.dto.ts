export class CreateProductsCategoryDto {
  icon?: string;
  name: string;
  description?: string;
  status: boolean;

  constructor(data: any = {}) {
    // 👇 Asignaciones seguras (sin .trim() sobre undefined)
    this.icon = data.icon ?? null;
    this.name = typeof data.name === 'string' ? data.name.trim() : data.name ?? '';
    this.description = typeof data.description === 'string' ? data.description.trim() : null;
    this.status = typeof data.status === 'boolean' ? data.status : true;
  }

  validate(): string[] {
    const errors: string[] = [];
    const hasNumbers = /\d/;

    // Validar nombre
    if (!this.name) {
      errors.push('The field "name" is required and must be a non-empty string.');
    } else if (typeof this.name !== 'string') {
      errors.push('The field "name" must be text.');
    } else if (this.name.length < 3) {
      errors.push('The name must have at least 3 characters.');
    } else if (this.name.length > 50) {
      errors.push('The name must not exceed 50 characters.');
    } else if (hasNumbers.test(this.name)) {
      errors.push('The name cannot contain numeric values.');
    }

    // Validar descripción
    if (this.description) {
      if (typeof this.description !== 'string') {
        errors.push('The description must be text.');
      } else if (this.description.length > 255) {
        errors.push('The description must not exceed 255 characters.');
      } else if (hasNumbers.test(this.description)) {
        errors.push('The description cannot contain numeric values.');
      }
    }

    // Validar icon
    if (this.icon && typeof this.icon !== 'string') {
      errors.push('The icon must be a text string (URL or base64).');
    }

    // Validar estado
    if (typeof this.status !== 'boolean') {
      errors.push('The status must be a boolean value (true or false).');
    }

    return errors;
  }
}
