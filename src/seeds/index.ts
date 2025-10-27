import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import CompanySeeder from './company.seed';
import UserSeeder from './user.seed';

export default class MainSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    const cleanupOrder = [
      'transaction_file',
      'transaction',
      'animal_file',
      'animal',
      'notification',
      'user',
      'company',
    ];

    await dataSource.transaction(async (manager) => {
      for (const table of cleanupOrder) {
        await manager.query(`DELETE FROM \`${table}\``);
      }
    });

    await new CompanySeeder().run(dataSource);
    await new UserSeeder().run(dataSource);
  }
}
