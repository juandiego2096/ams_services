import { DataSource } from 'typeorm';

export const datasource = new DataSource({
  type: 'mysql',
  host: process.env.MYSQL_HOST || 'localhost',
  port: Number(process.env.MYSQL_PORT || 3306),
  username: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'root',
  database: process.env.MYSQL_DB || 'ams_sales',
  entities: ['src/**/*.entity{.js}'],
  migrations: ['src/migrations/**/*.ts'],
  synchronize: true,
  migrationsRun: true,
});
