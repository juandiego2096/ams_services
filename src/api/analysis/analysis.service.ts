import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionEntity } from '@entities/transaction.entity';
import { Between, Repository } from 'typeorm';
import { salesAnalysisResume, salesQuantityMonth } from './analysis.type';
import { TRANSACTION_STATUS, TRANSACTION_TYPES } from '@constants/animals';

@Injectable()
export class AnalysisService {
  constructor(
    @InjectRepository(TransactionEntity)
    private readonly transactionRepository: Repository<TransactionEntity>,
  ) {}

  async getSalesAnalysisResume(companyId: string, userId: string | null = null): Promise<salesAnalysisResume | undefined> {
    return this.transactionRepository
      .createQueryBuilder('currentTransactions')
      .select('COUNT(currentTransactions.id) as currentQuantity')
      .addSelect('SUM(currentTransactions.totalTransaction) as currentTotal')
      .addSelect("DATE_FORMAT(currentTransactions.creationDate, '%Y-%m-01') AS currentDateStart")
      .addSelect('last_day(creationDate) as currentDateEnd')
      .addSelect('previousMonth.quantity AS previousQuantity')
      .addSelect('previousMonth.total AS previousTotal')
      .addSelect('previousMonth.dateStart AS previousDateStart')
      .addSelect('previousMonth.dateEnd AS previousDateEnd')
      .addSelect(
        'IF(previousMonth.quantity = 0 AND count(currentTransactions.id) > 0, 100, IFNULL(((count(currentTransactions.id) - previousMonth.quantity) / previousMonth.quantity * 100), 0)) AS quantityPercentage',
      )
      .addSelect(
        'IF(previousMonth.total = 0 AND SUM(currentTransactions.totalTransaction) > 0, 100, IFNULL(((SUM(currentTransactions.totalTransaction) - previousMonth.total) / previousMonth.total * 100), 0) ) AS totalPercentage',
      )
      .leftJoin(
        (subQuery) => {
          return subQuery
            .select('COUNT(previousTransactions.id) as quantity')
            .addSelect('IFNULL(SUM(previousTransactions.totalTransaction), 0) as total')
            .addSelect("DATE_FORMAT(NOW() - INTERVAL 1 MONTH, '%Y-%m-01') AS dateStart")
            .addSelect("DATE_FORMAT(LAST_DAY(NOW() - INTERVAL 1 MONTH), '%Y-%m-%d') as dateEnd")
            .from(TransactionEntity, 'previousTransactions')
            .where(
              "previousTransactions.companyId = :companyId AND previousTransactions.type = 1 AND previousTransactions.status = 2 AND previousTransactions.creationDate between DATE_FORMAT(NOW() - INTERVAL 1 MONTH, '%Y-%m-01') AND DATE_FORMAT(LAST_DAY(NOW() - INTERVAL 1 MONTH), '%Y-%m-%d')",
              { companyId },
            )
            .andWhere('IF(:userId is NULL, 1, previousTransactions.userId = :userId)', { userId });
        },
        'previousMonth',
        'previousMonth.quantity >= 0',
      )
      .where(
        "currentTransactions.companyId = :companyId AND currentTransactions.type = 1 AND currentTransactions.status = 2 AND currentTransactions.creationDate between DATE_FORMAT(NOW(), '%Y-%m-01') AND last_day(curdate())",
        { companyId },
      )
      .andWhere('IF(:userId is NULL, 1, currentTransactions.userId = :userId)', { userId })
      .getRawOne();
  }

  async getQuantitySalesByMonth(companyId: string, userId: string | null = null): Promise<salesQuantityMonth[]> {
    const response: salesQuantityMonth[] = [];
    for (let index = 1; index <= 12; index++) {
      const dateFrom = new Date(new Date().getFullYear(), index - 1, 1);
      const dateTo = new Date(new Date().getFullYear(), index, 1);
      dateTo.setDate(dateTo.getDate() - 1);
      let salesQuantity = 0;
      if (userId) {
        salesQuantity = await this.transactionRepository.count({
          where: {
            companyId,
            type: TRANSACTION_TYPES.SELL,
            status: TRANSACTION_STATUS.ACCEPTED,
            userId,
            creationDate: Between(dateFrom, dateTo),
          },
        });
      } else {
        salesQuantity = await this.transactionRepository.count({
          where: { companyId, type: TRANSACTION_TYPES.SELL, status: TRANSACTION_STATUS.ACCEPTED, creationDate: Between(dateFrom, dateTo) },
        });
      }
      const element: salesQuantityMonth = {
        index: index,
        salesQuantity: salesQuantity,
      };

      response.push(element);
    }

    return response;
  }
}
