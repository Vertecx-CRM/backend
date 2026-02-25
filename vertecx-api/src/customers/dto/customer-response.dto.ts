import { Customers } from '../entities/customers.entity';

export class CustomerResponseDto {
  customerid: number;
  customercity: string;
  customerzipcode: string;

  users: any;

  sales: any[];

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
  }
}