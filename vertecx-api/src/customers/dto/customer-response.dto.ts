import { ApiProperty } from '@nestjs/swagger';

export class CustomerResponseDto {
  @ApiProperty({ description: 'ID único del cliente', example: 1 })
  customerid: number;

  @ApiProperty({ description: 'ID del usuario asociado', example: 1 })
  userid: number;

  @ApiProperty({ description: 'Ciudad del cliente', example: 'Bogotá', required: false })
  customercity?: string;

  @ApiProperty({ description: 'Código postal', example: '110111', required: false })
  customerzipcode?: string;

  @ApiProperty({
    description: 'Información del usuario asociado (sin role ni password)',
    required: false,
    example: {
      userid: 1,
      username: 'johndoe',
      name: 'John',
      lastname: 'Doe',
      documentnumber: '1234567890',
      email: 'john@example.com'
    }
  })
  users?: {
    userid: number;
    username?: string;
    name?: string;
    lastname?: string;
    documentnumber?: string;
    email?: string;
    phone?: string;
    typeid?: number;
    documentnumber?: string;
    stateid?: number;
  };

  @ApiProperty({
    description: 'Ventas asociadas al cliente',
    required: false,
    type: 'array',
    items: {
      type: 'object'
    }
  })
  sales?: any[];

  constructor(customer: any) {
    this.customerid = customer.customerid;
    this.userid = customer.userid;
    this.customercity = customer.customercity || '';
    this.customerzipcode = customer.customerzipcode || '';

    // Mapear información del usuario asociado
    if (customer.users) {
      const name = customer.users.name?.trim() || '';
      const lastname = customer.users.lastname?.trim() || '';
      const fullName = [name, lastname].filter(Boolean).join(' ').trim();

      this.users = {
        userid: customer.users.userid,
        username: customer.users.username,
        name: customer.users.name,
        lastname: customer.users.lastname,
        documentnumber: customer.users.documentnumber,
        email: customer.users.email
      };
    }

    // Mapear ventas si existen
    if (customer.sales) {
      this.sales = Array.isArray(customer.sales) ? customer.sales : [];
    }
  }
}