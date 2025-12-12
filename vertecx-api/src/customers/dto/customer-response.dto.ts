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
    description: 'Información del usuario asociado',
    required: false,
    example: {
      userid: 1,
      username: 'johndoe',
      email: 'john@example.com'
    }
  })
  users?: {
    userid: number;
    username?: string;
    email?: string;
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
    this.customercity = customer.customercity;
    this.customerzipcode = customer.customerzipcode;
    
    if (customer.users) {
      this.users = {
        userid: customer.users.userid,
        username: customer.users.username,
        email: customer.users.email
      };
    }
    
    if (customer.sales) {
      this.sales = customer.sales;
    }
  }
}