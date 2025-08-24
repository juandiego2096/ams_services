import { GENDERS } from '@constants/animals';

export class createAnimalDto {
  status: number;
  specieId: string;
  breedId: string;
  colorId: string;
  birthDate: Date;
  companyId: string;
  gender: GENDERS;
  price: number;
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
  path: string;
  type: string;
  index: number;
  companyId: string;
}
