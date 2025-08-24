import { Module } from '@nestjs/common';
import { AnimalService } from './animal.service';
import { AnimalController } from './animal.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnimalEntity } from '@entities/animal.entity';
import { FileService } from '../file/file.service';
import { FileEntity } from '@entities/file.entity';
import { TransactionService } from '../transaction/transaction.service';
import { TransactionEntity } from '@entities/transaction.entity';
import { BreedEntity } from '@entities/breed.entity';
import { BreedService } from '../breed/breed.service';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [TypeOrmModule.forFeature([AnimalEntity, FileEntity, TransactionEntity, BreedEntity]), NotificationModule],
  controllers: [AnimalController],
  providers: [AnimalService, FileService, TransactionService, BreedService],
})
export class AnimalModule {}
