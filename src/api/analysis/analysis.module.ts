import { Module } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { AnalysisController } from './analysis.controller';
import { TransactionEntity } from '@entities/transaction.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionService } from '../transaction/transaction.service';

@Module({
  imports: [TypeOrmModule.forFeature([TransactionEntity])],
  controllers: [AnalysisController],
  providers: [AnalysisService, TransactionService],
})
export class AnalysisModule {}
