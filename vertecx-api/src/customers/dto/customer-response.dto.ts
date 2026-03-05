import { Customers } from '../entities/customers.entity';
import { Customers } from '../entities/customers.entity';

export class CustomerResponseDto {
  customerid: number;
  customercity: string;
  customerzipcode: string;

  users: any;

  sales: any[];

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
      fullName: 'John Doe',
      email: 'john@example.com',
      phone: '3001234567',
      typeid: 1,
      documentnumber: '123456789',
      stateid: 1
    }
  })
  users?: {
    userid: number;
    username?: string;
    name?: string;
    lastname?: string;
    documentnumber?: string;
    fullName?: string;
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
  customercity: string;
  customerzipcode: string;

  users: any;

  sales: any[];

  constructor(customer: Customers) {
  constructor(customer: Customers) {
    this.customerid = customer.customerid;
    this.customercity = customer.customercity;
    this.customerzipcode = customer.customerzipcode;

    this.users = customer.users
      ? {
          userid: customer.users.userid,
          name: customer.users.name,
          lastname: customer.users.lastname,
          email: customer.users.email,
          documentnumber: customer.users.documentnumber,
          phone: customer.users.phone,
          image: customer.users.image,

          typeofdocuments: customer.users.typeofdocuments
            ? {
                id:
                  (customer.users.typeofdocuments as any).typeid ??
                  (customer.users.typeofdocuments as any).typeofdocumentid ??
                  (customer.users.typeofdocuments as any).id,
                name: customer.users.typeofdocuments.name,
              }
            : null,

          states: customer.users.states
            ? {
                id:
                  (customer.users.states as any).stateid ??
                  (customer.users.states as any).id,
                name: customer.users.states.name,
              }
            : null,

          roles: customer.users.roles
            ? {
                id:
                  (customer.users.roles as any).roleid ??
                  (customer.users.roles as any).id,
                name: customer.users.roles.name,
              }
            : null,
        }
      : null;

    this.sales = customer.sales ?? [];
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
        username: name || undefined,
        fullName: fullName || undefined,
        email: customer.users.email || undefined,
        phone: customer.users.phone || undefined,
        typeid: customer.users.typeid || undefined,
        documentnumber: customer.users.documentnumber || undefined,
        stateid: customer.users.stateid || undefined,
      };
    }

    // Mapear ventas si existen
    if (customer.sales) {
      this.sales = Array.isArray(customer.sales) ? customer.sales : [];
    }
  }
}

    this.users = customer.users
      ? {
          userid: customer.users.userid,
          name: customer.users.name,
          lastname: customer.users.lastname,
          email: customer.users.email,
          documentnumber: customer.users.documentnumber,
          phone: customer.users.phone,
          image: customer.users.image,

          typeofdocuments: customer.users.typeofdocuments
            ? {
                id:
                  (customer.users.typeofdocuments as any).typeid ??
                  (customer.users.typeofdocuments as any).typeofdocumentid ??
                  (customer.users.typeofdocuments as any).id,
                name: customer.users.typeofdocuments.name,
              }
            : null,

          states: customer.users.states
            ? {
                id:
                  (customer.users.states as any).stateid ??
                  (customer.users.states as any).id,
                name: customer.users.states.name,
              }
            : null,

          roles: customer.users.roles
            ? {
                id:
                  (customer.users.roles as any).roleid ??
                  (customer.users.roles as any).id,
                name: customer.users.roles.name,
              }
            : null,
        }
      : null;

    this.sales = customer.sales ?? [];
  }
}