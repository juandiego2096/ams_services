import { Test, TestingModule } from '@nestjs/testing';
import { AnalysisController } from './analysis.controller';
import { AnalysisService } from './analysis.service';
import { TransactionService } from '../transaction/transaction.service';
import { AuthGuard } from '../auth/auth.guard';
import { TRANSACTION_STATUS, TRANSACTION_TYPES } from '@constants/animals';

describe('AnalysisController', () => {
  let controller: AnalysisController;
  let analysisService: jest.Mocked<AnalysisService>;
  let transactionService: jest.Mocked<TransactionService>;

  beforeEach(async () => {
    const moduleBuilder = Test.createTestingModule({
      controllers: [AnalysisController],
      providers: [
        {
          provide: AnalysisService,
          useValue: {
            getSalesAnalysisResume: jest.fn(),
            getQuantitySalesByMonth: jest.fn(),
          },
        },
        {
          provide: TransactionService,
          useValue: {
            getTransactions: jest.fn(),
            getTransactionsByUserId: jest.fn(),
          },
        },
      ],
    });

    const module: TestingModule = await moduleBuilder
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn().mockResolvedValue(true) })
      .compile();

    controller = module.get<AnalysisController>(AnalysisController);
    analysisService = module.get(AnalysisService) as jest.Mocked<AnalysisService>;
    transactionService = module.get(TransactionService) as jest.Mocked<TransactionService>;
  });

  afterEach(() => jest.clearAllMocks());

  it('should build dashboard analysis for company scope', async () => {
    analysisService.getSalesAnalysisResume.mockResolvedValue({
      currentTotal: 1000,
      totalPercentage: 50,
      currentQuantity: 5,
      quantityPercentage: 20,
    } as any);
    transactionService.getTransactions.mockResolvedValueOnce([{ id: 'res' }] as any);
    transactionService.getTransactions.mockResolvedValueOnce([{ id: 'sell1' }, { id: 'sell2' }] as any);
    analysisService.getQuantitySalesByMonth.mockResolvedValue(
      Array.from({ length: 12 }, (_, index) => ({ index: index + 1, salesQuantity: index })),
    );

    const result = await controller.getDashboardAnalysis('company-1');

    expect(analysisService.getSalesAnalysisResume).toHaveBeenCalledWith('company-1');
    expect(transactionService.getTransactions).toHaveBeenCalledWith('company-1', TRANSACTION_TYPES.RESERVATION, [TRANSACTION_STATUS.PENDING]);
    expect(result.salesQuantityPending).toBe(2);
    expect(result.salesQuantityYear).toHaveLength(12);
    expect(result.salesTotal).toBe(1000);
  });

  it('should build dashboard analysis for current user', async () => {
    analysisService.getSalesAnalysisResume.mockResolvedValue({
      currentTotal: 0,
      totalPercentage: 0,
      currentQuantity: 0,
      quantityPercentage: 0,
    } as any);
    transactionService.getTransactionsByUserId.mockResolvedValueOnce([{ id: 'reservation' }] as any);
    transactionService.getTransactionsByUserId.mockResolvedValueOnce([] as any);
    analysisService.getQuantitySalesByMonth.mockResolvedValue([]);

    const result = await controller.getSelfDashboardAnalysis({ userId: 'user-1' } as any, 'company-1');

    expect(analysisService.getSalesAnalysisResume).toHaveBeenCalledWith('company-1', 'user-1');
    expect(transactionService.getTransactionsByUserId).toHaveBeenCalledWith(
      TRANSACTION_TYPES.RESERVATION,
      [TRANSACTION_STATUS.PENDING],
      'user-1',
    );
    expect(result.salesQuantity).toBe(0);
    expect(result.reservationsQuantity).toBe(1);
  });
});
