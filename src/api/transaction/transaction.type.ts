import { TRANSACTION_TYPES, TRANSACTION_STATUS } from '@constants/animals';

export class createAnimalTransactionDto {
  type: TRANSACTION_TYPES;
  status: TRANSACTION_STATUS;
  animalId: string;
  userId: string;
  lastUpdatedUserId: string;
  details: string;
  totalTransaction: number;
  pictures: string[];
  parentTransactionId: string;
  companyId: string;
}

export class animalTransactionDto extends createAnimalTransactionDto {
  id: string;
  creationDate: Date;
  lastUpdatedDate: Date;
}
