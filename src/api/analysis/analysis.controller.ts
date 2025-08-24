import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { AuthGuard } from '../auth/auth.guard';
import { dashboardAnalysis } from './analysis.type';
import { TransactionService } from '../transaction/transaction.service';
import { TRANSACTION_STATUS, TRANSACTION_TYPES } from '@constants/animals';

@UseGuards(AuthGuard)
@Controller('analysis/:companyId')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService, private readonly transactionService: TransactionService) {}

  @Get('getDashboardAnalysis')
  async getDashboardAnalysis(@Param('companyId') companyId: string): Promise<dashboardAnalysis> {
    const [dashboardAnalysis, dashboardReservations, dashboardSellsPending, quantitySalesByMonth] = [
      await this.analysisService.getSalesAnalysisResume(companyId),
      await this.transactionService.getTransactions(companyId, TRANSACTION_TYPES.RESERVATION, [TRANSACTION_STATUS.PENDING]),
      await this.transactionService.getTransactions(companyId, TRANSACTION_TYPES.SELL, [TRANSACTION_STATUS.PENDING]),
      await this.analysisService.getQuantitySalesByMonth(companyId),
    ];
    const response: dashboardAnalysis = {
      salesTotal: dashboardAnalysis ? Math.round(dashboardAnalysis.currentTotal) : 0,
      salesTotalPercent: dashboardAnalysis ? Math.round(dashboardAnalysis.totalPercentage) : 0,
      salesQuantity: dashboardAnalysis ? Math.round(dashboardAnalysis.currentQuantity) : 0,
      salesQuantityPending: dashboardSellsPending ? dashboardSellsPending.length : 0,
      salesQuantityPercent: dashboardAnalysis ? Math.round(dashboardAnalysis.quantityPercentage) : 0,
      reservationsQuantity: dashboardReservations ? dashboardReservations.length : 0,
      salesQuantityYear: quantitySalesByMonth,
    };
    return response;
  }

  @Get('getSelfDashboardAnalysis')
  async getSelfDashboardAnalysis(@Request() req, @Param('companyId') companyId: string): Promise<dashboardAnalysis> {
    const [dashboardAnalysis, dashboardReservations, dashboardSellsPending, quantitySalesByMonth] = [
      await this.analysisService.getSalesAnalysisResume(companyId, req.userId),
      await this.transactionService.getTransactionsByUserId(TRANSACTION_TYPES.RESERVATION, [TRANSACTION_STATUS.PENDING], req.userId),
      await this.transactionService.getTransactionsByUserId(TRANSACTION_TYPES.SELL, [TRANSACTION_STATUS.PENDING], req.userId),
      await this.analysisService.getQuantitySalesByMonth(companyId, req.userId),
    ];
    const response: dashboardAnalysis = {
      salesTotal: dashboardAnalysis ? Math.round(dashboardAnalysis.currentTotal) : 0,
      salesTotalPercent: dashboardAnalysis ? Math.round(dashboardAnalysis.totalPercentage) : 0,
      salesQuantity: dashboardAnalysis ? Math.round(dashboardAnalysis.currentQuantity) : 0,
      salesQuantityPending: dashboardSellsPending ? dashboardSellsPending.length : 0,
      salesQuantityPercent: dashboardAnalysis ? Math.round(dashboardAnalysis.quantityPercentage) : 0,
      reservationsQuantity: dashboardReservations ? dashboardReservations.length : 0,
      salesQuantityYear: quantitySalesByMonth,
    };
    return response;
  }
}
