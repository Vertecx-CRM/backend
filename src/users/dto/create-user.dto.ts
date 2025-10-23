export class CreateUserDto {
  firstName: string;
  secondName?: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  documentType: string;
  documentNumber: string;
  image?: string;
  status: boolean;

  constructor(data: any) {
    this.firstName = (data.firstName || '').trim();
    this.secondName = (data.secondName || '').trim();
    this.email = (data.email || '').trim();
    this.password = (data.password || '').trim();
    this.confirmPassword = (data.confirmPassword || '').trim();
    this.phoneNumber = (data.phoneNumber || '').trim();
    this.documentType = (data.documentType || '').trim();
    this.documentNumber = (data.documentNumber || '').trim();
    this.image = (data.image || '').trim();
    this.status = data.status ?? true; 
  }

  validate(): string[] {
    const errors: string[] = [];
    const hasNumbers = /\d/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validDocumentTypes = ['CC', 'CE', 'TI', 'NIT', 'PAS']; 

    //  Validar firstName
    if (!this.firstName) {
      errors.push('First name is required.');
    } else if (this.firstName.length < 3) {
      errors.push('First name must have at least 3 characters.');
    } else if (this.firstName.length > 50) {
      errors.push('First name must not exceed 50 characters.');
    } else if (hasNumbers.test(this.firstName)) {
      errors.push('First name cannot contain numbers.');
    }

    // Validar secondName (si viene)
    if (this.secondName && hasNumbers.test(this.secondName)) {
      errors.push('Second name cannot contain numbers.');
    }

    // Validar email
    if (!this.email) {
      errors.push('Email is required.');
    } else if (!emailRegex.test(this.email)) {
      errors.push('Email format is invalid.');
    }

    // Validar password
    if (!this.password) {
      errors.push('Password is required.');
    } else if (this.password.length < 6) {
      errors.push('Password must have at least 6 characters.');
    }

    // Validar confirmPassword
    if (!this.confirmPassword) {
      errors.push('Confirm password is required.');
    } else if (this.password !== this.confirmPassword) {
      errors.push('Passwords do not match.');
    }

    // Validar phoneNumber
    if (!this.phoneNumber) {
      errors.push('Phone number is required.');
    } else if (!/^[0-9]{7,15}$/.test(this.phoneNumber)) {
      errors.push('Phone number must contain only digits (7–15 characters).');
    }

    // Validar documentType
    if (!this.documentType) {
      errors.push('Document type is required.');
    } else if (!validDocumentTypes.includes(this.documentType.toUpperCase())) {
      errors.push(
        `Invalid document type. Valid types are: ${validDocumentTypes.join(', ')}.`
      );
    }

    // Validar documentNumber
    if (!this.documentNumber) {
      errors.push('Document number is required.');
    } else if (!/^[0-9]{5,20}$/.test(this.documentNumber)) {
      errors.push('Document number must contain only digits.');
    }

    // Validar image
    if (this.image && typeof this.image !== 'string') {
      errors.push('Image must be a string (URL or base64).');
    }

    // Validar status
    if (typeof this.status !== 'boolean') {
      errors.push('Status must be a boolean value (true or false).');
    }

    return errors;
  }
}
