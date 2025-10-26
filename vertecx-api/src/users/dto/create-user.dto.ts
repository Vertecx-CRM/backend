export class CreateUserDto {
  name: string;
  lastname: string;
  email: string;
  password: string;
  confirmPassword: string;     
  phone: string;
  typeid: number;
  documentnumber: string;
  image?: string;
  stateid: number;

  constructor(data: any) {
    this.name = String(data.name || '').trim();
    this.lastname = String(data.lastname || '').trim();
    this.email = String(data.email || '').trim();
    this.password = String(data.password || '').trim();
    this.confirmPassword = String(data.confirmPassword || '').trim();
    this.phone = String(data.phone || '').trim();
    this.typeid = Number(data.typeid) || 0;
    this.documentnumber = String(data.documentnumber || '').trim();
    this.image = data.image ? String(data.image).trim() : '';
    this.stateid = Number(data.stateid) || 1;
  }

  validate(): string[] {
    const errors: string[] = [];
    const hasNumbers = /\d/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // name
    if (!this.name) {
      errors.push('Name is required.');
    } else if (this.name.length < 3) {
      errors.push('Name must have at least 3 characters.');
    } else if (hasNumbers.test(this.name)) {
      errors.push('Name cannot contain numbers.');
    }

    // lastname
    if (!this.lastname) {
      errors.push('Lastname is required.');
    } else if (hasNumbers.test(this.lastname)) {
      errors.push('Lastname cannot contain numbers.');
    }

    // email
    if (!this.email) {
      errors.push('Email is required.');
    } else if (!emailRegex.test(this.email)) {
      errors.push('Email format is invalid.');
    }

    // password
    if (!this.password) {
      errors.push('Password is required.');
    } else if (this.password.length < 6) {
      errors.push('Password must have at least 6 characters.');
    }

    // confirm password
    if (!this.confirmPassword) {
      errors.push('Confirm password is required.');
    } else if (this.password !== this.confirmPassword) {
      errors.push('Passwords do not match.');
    }

    // phone
    if (!this.phone) {
      errors.push('Phone is required.');
    } else if (!/^[0-9]{7,15}$/.test(this.phone)) {
      errors.push('Phone must contain only digits (7–15 characters).');
    }

    // documentnumber
    if (!this.documentnumber) {
      errors.push('Document number is required.');
    } else if (!/^[0-9]{5,20}$/.test(this.documentnumber)) {
      errors.push('Document number must contain only digits (5–20 characters).');
    }

    // typeid
    if (!this.typeid || isNaN(this.typeid)) {
      errors.push('Type ID (typeid) is required and must be a valid number.');
    }

    // stateid
    if (!this.stateid || isNaN(this.stateid)) {
      errors.push('State ID (stateid) is required and must be a valid number.');
    }

    // image
    if (this.image && typeof this.image !== 'string') {
      errors.push('Image must be a string (URL or base64).');
    }

    return errors;
  }
}
