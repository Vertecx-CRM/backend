export class UpdateUserDto {
  firstName?: string;
  secondName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phoneNumber?: string;
  documentType?: string;
  documentNumber?: string;
  image?: string;
  status?: boolean;

  constructor(data: any) {
    this.firstName = data.firstName?.trim();
    this.secondName = data.secondName?.trim();
    this.email = data.email?.trim();
    this.password = data.password?.trim();
    this.confirmPassword = data.confirmPassword?.trim();
    this.phoneNumber = data.phoneNumber?.trim();
    this.documentType = data.documentType?.trim();
    this.documentNumber = data.documentNumber?.trim();
    this.image = data.image?.trim();
    this.status = data.status;
  }

  validate(): string[] {
    const errors: string[] = [];
    const hasNumbers = /\d/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validDocumentTypes = ['CC', 'CE', 'TI', 'NIT', 'PAS'];

    // firstName
    if (this.firstName) {
      if (this.firstName.length < 3) {
        errors.push('First name must have at least 3 characters.');
      } else if (this.firstName.length > 50) {
        errors.push('First name must not exceed 50 characters.');
      } else if (hasNumbers.test(this.firstName)) {
        errors.push('First name cannot contain numbers.');
      }
    }

    // secondName
    if (this.secondName && hasNumbers.test(this.secondName)) {
      errors.push('Second name cannot contain numbers.');
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

    // phoneNumber
    if (this.phoneNumber && !/^[0-9]{7,15}$/.test(this.phoneNumber)) {
      errors.push('Phone number must contain only digits (7–15 characters).');
    }

    // documentType
    if (this.documentType && !validDocumentTypes.includes(this.documentType.toUpperCase())) {
      errors.push(
        `Invalid document type. Valid types are: ${validDocumentTypes.join(', ')}.`
      );
    }

    // documentNumber
    if (this.documentNumber && !/^[0-9]{5,20}$/.test(this.documentNumber)) {
      errors.push('Document number must contain only digits.');
    }

    // image
    if (this.image && typeof this.image !== 'string') {
      errors.push('Image must be a string (URL or base64).');
    }

    // status
    if (this.status !== undefined && typeof this.status !== 'boolean') {
      errors.push('Status must be a boolean value (true or false).');
    }

    return errors;
  }
}
