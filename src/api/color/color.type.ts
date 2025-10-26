import { IsBoolean, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class createColorDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsBoolean()
  active: boolean;

  @IsUUID()
  createdBy: string;
}
