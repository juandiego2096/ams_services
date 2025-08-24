import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

export default function ofConfig(configService: ConfigService): TypeOrmModuleOptions {
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
    synchronize: true,
    ssl: false,
  };
}
