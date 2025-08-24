import { IsEnum, IsString, IsEmail, IsUUID, IsBoolean, IsOptional } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';
import { ROLES } from '@constants/roles';

export class CreateUserDto {
  @IsEnum(ROLES)
  role: ROLES;

  @IsString()
  username: string;

  @IsString()
  password: string;

  @IsString()
  name: string;

  @IsString()
  lastname: string;

  @IsEmail()
  email: string;

  @IsString()
  address: string;

  @IsString()
  phone: string;

  @IsUUID()
  companyId: string;

  @IsBoolean()
  active: boolean;
}

export class UserResponseDto {
  @Expose()
  id: string;

  @Expose()
  role: ROLES;

  @Expose()
  username: string;

  @Exclude()
  password: string; // no queremos devolverlo

  @Expose()
  name: string;

  @Expose()
  lastname: string;

  @Expose()
  creationDate: Date;

  @Expose()
  email: string;

  @Expose()
  phone: string;

  @Expose()
  address: string;

  @Expose()
  companyId: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsEnum(ROLES)
  role?: ROLES;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  lastname?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsUUID()
  companyId?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
