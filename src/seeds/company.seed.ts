// src/db/seeds/user.seeder.ts
import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { CompanyEntity } from '@entities/company.entity';

export default class CompanySeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    const repository = dataSource.getRepository(CompanyEntity);

    await repository.delete({});

    await repository.insert([
      {
        id: 'f06dc56e-950e-4eeb-a851-8d23cfaa6e34',
        name: 'Company 1',
        creationDate: new Date(),
        createdBy: 'c609fb28-64bd-45da-a35f-bbc86b73c35e',
      },
    ]);
  }
}
