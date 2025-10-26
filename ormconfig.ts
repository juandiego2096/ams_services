import { config } from 'dotenv';
import { existsSync } from 'fs';
import { join } from 'path';
import { DataSource } from 'typeorm';

const nodeEnv = process.env.NODE_ENV ?? 'development';
const envFiles = [`.env.${nodeEnv}.local`, `.env.${nodeEnv}`, '.env.local', '.env', '.env.secrets'];

for (let i = envFiles.length - 1; i >= 0; i--) {
  const filePath = join(__dirname, envFiles[i]);
  if (existsSync(filePath)) {
    config({ path: filePath });
  }
}

const synchronizeEnv = process.env.TYPEORM_SYNCHRONIZE;
const runMigrationsEnv = process.env.TYPEORM_RUN_MIGRATIONS;
const synchronize = synchronizeEnv ? synchronizeEnv === 'true' : nodeEnv !== 'production';
const migrationsRun = runMigrationsEnv ? runMigrationsEnv === 'true' : nodeEnv !== 'development';

export const datasource = new DataSource({
  type: 'mysql',
  host: process.env.MYSQL_HOST || 'localhost',
  port: Number(process.env.MYSQL_PORT || 3306),
  username: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'root',
  database: process.env.MYSQL_DB || 'ams_sales',
  entities: ['src/**/*.entity{.ts,.js}'],
  migrations: ['src/migrations/**/*{.ts,.js}'],
  synchronize,
  migrationsRun,
  ssl: process.env.MYSQL_SSL === 'true',
});
