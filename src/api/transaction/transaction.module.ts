import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { TransactionEntity } from '@entities/transaction.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnimalService } from '../animal/animal.service';
import { AnimalEntity } from '@entities/animal.entity';
import { FileService } from '../file/file.service';
import { FileEntity } from '@entities/file.entity';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [TypeOrmModule.forFeature([TransactionEntity, AnimalEntity, FileEntity]), NotificationModule],
  controllers: [TransactionController],
  providers: [TransactionService, AnimalService, FileService],
})
export class TransactionModule {}
