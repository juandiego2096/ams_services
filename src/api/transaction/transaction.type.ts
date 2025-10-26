import { TRANSACTION_TYPES, TRANSACTION_STATUS } from '@constants/animals';
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class createAnimalTransactionDto {
  @IsOptional()
  @IsEnum(TRANSACTION_TYPES)
  type: TRANSACTION_TYPES;

  @IsOptional()
  @IsEnum(TRANSACTION_STATUS)
  status: TRANSACTION_STATUS;

  @IsUUID()
  animalId: string;

  @IsOptional()
  @IsUUID()
  userId: string;

  @IsOptional()
  @IsUUID()
  lastUpdatedUserId: string;

  @IsString()
  @IsNotEmpty()
  details: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  totalTransaction: number;

  @IsArray()
  @IsUUID(undefined, { each: true })
  pictures: string[];

  @IsOptional()
  @IsUUID()
  parentTransactionId: string;

  @IsOptional()
  @IsUUID()
  companyId: string;
}

export class animalTransactionDto extends createAnimalTransactionDto {
  id: string;
  creationDate: Date;
  lastUpdatedDate: Date;
}
