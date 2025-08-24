import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import ofDbOptions from '../utils/config/db.config';
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
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: ofDbOptions,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.secrets'],
    }),
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
