import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class createCompanyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  phone: string;

  @IsUUID()
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
