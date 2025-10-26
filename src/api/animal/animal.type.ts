import { GENDERS, STATUS } from '@constants/animals';
import { IsArray, IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class createAnimalDto {
  @IsOptional()
  @IsEnum(STATUS)
  status: STATUS;

  @IsUUID()
  specieId: string;

  @IsUUID()
  breedId: string;

  @IsUUID()
  colorId: string;

  @IsDateString()
  birthDate: string;

  @IsOptional()
  @IsUUID()
  companyId: string;

  @IsEnum(GENDERS)
  gender: GENDERS;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;

  @IsArray()
  @IsUUID('4', { each: true })
  pictures: string[];
}

export class AnimalDto {
  id: string;
  status: number;
  specieId: string;
  breedId: string;
  colorId: string;
  birthDate: Date;
  creationDate: Date;
  companyId: string;
  gender: GENDERS;
  price: number;
  pendingTransaction = false;
}

export class createAnimalFileDto {
  @IsString()
  @IsNotEmpty()
  path: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  index: number;

  @IsUUID()
  companyId: string;
}
