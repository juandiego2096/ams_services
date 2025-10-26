import { IsBoolean, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class createSpecieDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsBoolean()
  active: boolean;

  @IsUUID()
  createdBy: string;
}
