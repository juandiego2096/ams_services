import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class createBreedDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsUUID()
  specieId: string;

  @IsBoolean()
  active: boolean;

  @IsOptional()
  @IsUUID()
  pictureId: string;

  @IsOptional()
  @IsUUID()
  createdBy: string;
}
