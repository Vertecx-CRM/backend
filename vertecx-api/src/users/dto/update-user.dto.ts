export class UpdateUserDto {
  name?: string;               // Opcional
  lastname?: string;           // Opcional
  email?: string;              // Opcional
  password?: string;           // Opcional
  confirmPassword?: string;    // Opcional
  phone?: string;              // Opcional (string, 7–15 dígitos)
  typeid?: number;             // Opcional (FK tipo documento)
  documentnumber?: string;     // Opcional (string, 5–20 dígitos)
  image?: string;              // Opcional
  stateid?: number;            // Opcional (FK estado)

  constructor(data: any) {
    this.name = data.name ? String(data.name).trim() : undefined;
    this.lastname = data.lastname ? String(data.lastname).trim() : undefined;
    this.email = data.email ? String(data.email).trim() : undefined;
    this.password = data.password ? String(data.password).trim() : undefined;
    this.confirmPassword = data.confirmPassword ? String(data.confirmPassword).trim() : undefined;
    this.phone = data.phone ? String(data.phone).trim() : undefined;
    this.typeid = data.typeid !== undefined ? Number(data.typeid) : undefined;
    this.documentnumber = data.documentnumber ? String(data.documentnumber).trim() : undefined;
    this.image = data.image ? String(data.image).trim() : undefined;
    this.stateid = data.stateid !== undefined ? Number(data.stateid) : undefined;
  }

  validate(): string[] {
    const errors: string[] = [];
    const hasNumbers = /\d/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // name
    if (this.name) {
      if (this.name.length < 3) {
        errors.push('Name must have at least 3 characters.');
      } else if (this.name.length > 50) {
        errors.push('Name must not exceed 50 characters.');
      } else if (hasNumbers.test(this.name)) {
        errors.push('Name cannot contain numbers.');
      }
    }

    // lastname
    if (this.lastname && hasNumbers.test(this.lastname)) {
      errors.push('Lastname cannot contain numbers.');
    }

    // email
    if (this.email && !emailRegex.test(this.email)) {
      errors.push('Email format is invalid.');
    }

    // password + confirmPassword
    if (this.password && this.password.length < 6) {
      errors.push('Password must have at least 6 characters.');
    }

    if (this.confirmPassword && this.password !== this.confirmPassword) {
      errors.push('Passwords do not match.');
    }

    // phone
    if (this.phone) {
      if (!/^[0-9]{7,15}$/.test(this.phone)) {
        errors.push('Phone must contain only digits (7–15 characters).');
      }
    }

    // documentnumber
    if (this.documentnumber) {
      if (!/^[0-9]{5,20}$/.test(this.documentnumber)) {
        errors.push('Document number must contain only digits (5–20 characters).');
      }
    }

    // typeid
    if (this.typeid !== undefined && isNaN(this.typeid)) {
      errors.push('Type ID (typeid) must be a valid number.');
    }

    // stateid
    if (this.stateid !== undefined && isNaN(this.stateid)) {
      errors.push('State ID (stateid) must be a valid number.');
    }

    // image
    if (this.image && typeof this.image !== 'string') {
      errors.push('Image must be a string (URL or base64).');
    }

    return errors;
  }
}
