// src/db/seeds/user.seeder.ts
import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { CompanyEntity } from '@entities/company.entity';

export default class UserSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    await dataSource.query('TRUNCATE "user" RESTART IDENTITY;');

    const repository = dataSource.getRepository(CompanyEntity);
    await repository.insert({
      id: 'f06dc56e-950e-4eeb-a851-8d23cfaa6e34',
      name: 'Company 1',
      creationDate: new Date(),
      createdBy: 'c609fb28-64bd-45da-a35f-bbc86b73c35e',
    });
  }
}
