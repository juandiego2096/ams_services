import { registerAs } from '@nestjs/config';

export const tableNames = {
  company: 'company',
  user: 'user',
  specie: 'specie',
  breed: 'breed',
  animal: 'animal',
  color: 'color',
  file: 'file',
  animalFile: 'animal_file',
  transaction: 'transaction',
  transactionFile: 'transaction_file',
  notification: 'notification',
};

export type TableNames = typeof tableNames;

export default registerAs('tableNames', () => tableNames);
