import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import CompanySeeder from './company.seed';
import UserSeeder from './user.seed';

export default class MainSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    await new CompanySeeder().run(dataSource);
    await new UserSeeder().run(dataSource);
  }
}
