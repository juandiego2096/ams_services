import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import appConfig from '../config/app.config';
import { ConfigurationModule } from '../config/configuration.module';
import ofDbOptions from '../utils/config/db.config';

const nodeEnv = process.env.NODE_ENV ?? 'development';
const envFiles = [`.env.${nodeEnv}.local`, `.env.${nodeEnv}`, '.env.local', '.env', '.env.secrets'];
import { CompanyModule } from './company/company.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { AnimalModule } from './animal/animal.module';
import { FileModule } from './file/file.module';
import { SpecieModule } from './specie/specie.module';
import { BreedModule } from './breed/breed.module';
import { ColorModule } from './color/color.module';
import { TransactionModule } from './transaction/transaction.module';
import { AnalysisModule } from './analysis/analysis.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: envFiles,
      load: [appConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: ofDbOptions,
    }),
    ConfigurationModule,
    CompanyModule,
    UserModule,
    AuthModule,
    AnimalModule,
    FileModule,
    SpecieModule,
    BreedModule,
    ColorModule,
    TransactionModule,
    AnalysisModule,
    NotificationModule,
  ],
})
export class ApiModule {}
