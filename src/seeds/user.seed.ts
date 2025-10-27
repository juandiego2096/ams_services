import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { UserEntity } from '@entities/user.entity';
import { ROLES } from '@constants/roles';

export default class UserSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    const repository = dataSource.getRepository(UserEntity);

    await repository.delete({});

    await repository.insert([
      {
        id: 'c609fb28-64bd-45da-a35f-bbc86b73c35e',
        role: ROLES.SUPER_ADMIN,
        username: 'root',
        password: '$2a$12$zFXxFQPrHE9UylMJNxxd4eJ3FngDzx2Qhl4lUMIEkh3ZdVf2IPOfK',
        name: 'root',
        lastname: 'root',
        creationDate: new Date(),
        email: 'root@test.com',
        active: true,
      },
      {
        id: 'a2a81a1e-1d65-4a4f-8f52-0b83f200d3c8',
        role: ROLES.ADMIN,
        username: 'admin',
        password: '$2b$10$TJdeNJDgGfFRg5g0WQLRhOfVNy8B0sZJH5SKI7fCEbCsJbi150kj2',
        name: 'Admin',
        lastname: 'User',
        creationDate: new Date(),
        companyId: 'f06dc56e-950e-4eeb-a851-8d23cfaa6e34',
        email: 'admin@test.com',
        active: true,
      },
      {
        id: 'f6c50c4e-5f1a-4a33-8a1b-e0106cda8cbe',
        role: ROLES.SELLER,
        username: 'seller',
        password: '$2b$10$hgjCq3ORa3WRshLfzTSh0.TybWBpxRXKVAMLpw3s1HwweMtO2NPLi',
        name: 'Seller',
        lastname: 'User',
        creationDate: new Date(),
        companyId: 'f06dc56e-950e-4eeb-a851-8d23cfaa6e34',
        email: 'seller@test.com',
        active: true,
      },
    ]);
  }
}
