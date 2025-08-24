// src/db/seeds/user.seeder.ts
import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { UserEntity } from '@entities/user.entity';
import { ROLES } from '@constants/roles';

export default class UserSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    await dataSource.query('TRUNCATE "user" RESTART IDENTITY;');

    const repository = dataSource.getRepository(UserEntity);
    await repository.insert({
      id: 'c609fb28-64bd-45da-a35f-bbc86b73c35e',
      role: ROLES.SUPER_ADMIN,
      username: 'root',
      password: '$2a$12$zFXxFQPrHE9UylMJNxxd4eJ3FngDzx2Qhl4lUMIEkh3ZdVf2IPOfK',
      name: 'root',
      lastname: 'root',
      creationDate: new Date(),
      email: 'root@test.com',
      active: true,
    });
    await repository.insert({
      id: 'f06dc56e-950e-4eeb-a851-8d23cfaa6e34',
      role: ROLES.ADMIN,
      username: 'admin',
      password: '$2b$10$TJdeNJDgGfFRg5g0WQLRhOfVNy8B0sZJH5SKI7fCEbCsJbi150kj2',
      name: 'admin',
      lastname: 'admin',
      creationDate: new Date(),
      companyId: 'fd057d3b-2526-4851-8745-9fb59643f7e6',
      email: 'admin@test.com',
      active: true,
    });
    await repository.insert({
      id: 'f06dc56e-950e-4eeb-a851-8d23cfaa6e34',
      role: ROLES.SELLER,
      username: 'seller',
      password: '$2b$10$hgjCq3ORa3WRshLfzTSh0.TybWBpxRXKVAMLpw3s1HwweMtO2NPLi',
      name: 'seller',
      lastname: 'seller',
      creationDate: new Date(),
      companyId: 'fd057d3b-2526-4851-8745-9fb59643f7e6',
      email: 'admin@test.com',
      active: true,
    });
  }
}
