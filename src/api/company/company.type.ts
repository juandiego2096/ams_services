export class createCompanyDto {
  name: string;
  email: string;
  address: string;
  phone: string;
  createdBy: string;
}

export class CompanyDto {
  id: string;
  name: string;
  creationDate: Date;
  createdBy: string;
  email: string;
  phone: string;
  address: string;
}
