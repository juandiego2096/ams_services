import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

export default function ofConfig(configService: ConfigService): TypeOrmModuleOptions {
  const nodeEnv = configService.get<string>('NODE_ENV', process.env.NODE_ENV ?? 'development');
  const synchronizeFlag = configService.get<string>('TYPEORM_SYNCHRONIZE');
  const migrationsRunFlag = configService.get<string>('TYPEORM_RUN_MIGRATIONS');

  const synchronize = synchronizeFlag ? synchronizeFlag === 'true' : nodeEnv !== 'production';
  const migrationsRun = migrationsRunFlag ? migrationsRunFlag === 'true' : nodeEnv !== 'development';

  return {
    type: 'mysql',
    driver: {},
    host: configService.get<string>('MYSQL_HOST', 'localhost'),
    port: Number(configService.get<string>('MYSQL_PORT', '3306')),
    username: configService.get<string>('MYSQL_USER', 'root'),
    password: configService.get<string>('MYSQL_PASSWORD', 'root'),
    database: configService.get<string>('MYSQL_DB', 'ams_sales'),
    entities: [join(__dirname, '../../', '**', '*.entity.{ts,js}')],
    migrations: [join(__dirname, '../../', '**', 'migrations/**/*.ts')],
    retryAttempts: 20,
    synchronize,
    migrationsRun,
    ssl: configService.get<string>('MYSQL_SSL', 'false') === 'true',
  };
}
