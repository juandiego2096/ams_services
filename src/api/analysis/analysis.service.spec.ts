import { Test, TestingModule } from '@nestjs/testing';
import { AnalysisService } from './analysis.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TransactionEntity } from '@entities/transaction.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';

describe('AnalysisService', () => {
  let service: AnalysisService;
  let repository: jest.Mocked<Repository<TransactionEntity>>;
  const repositoryToken = getRepositoryToken(TransactionEntity);

  beforeEach(async () => {
    const repoMock: Partial<jest.Mocked<Repository<TransactionEntity>>> = {
      createQueryBuilder: jest.fn(),
      count: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalysisService,
        { provide: repositoryToken, useValue: repoMock },
        { provide: ConfigService, useValue: {} },
      ],
    }).compile();

    service = module.get<AnalysisService>(AnalysisService);
    repository = module.get(repositoryToken);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const buildQueryBuilderMock = () => {
    const qb: any = {
      select: jest.fn(),
      addSelect: jest.fn(),
      leftJoin: jest.fn(),
      leftJoinAndSelect: jest.fn(),
      where: jest.fn(),
      andWhere: jest.fn(),
      getRawOne: jest.fn(),
    };
    const chainableKeys = ['select', 'addSelect', 'leftJoin', 'leftJoinAndSelect', 'where', 'andWhere'];
    chainableKeys.forEach((key) => {
      qb[key].mockReturnValue(qb);
    });
    qb.getRawOne.mockResolvedValue({
      currentTotal: 100,
      currentQuantity: 4,
      totalPercentage: 10,
      quantityPercentage: 25,
    });
    return qb;
  };

  it('should build sales resume query and return raw data', async () => {
    const qb = buildQueryBuilderMock();
    repository.createQueryBuilder.mockReturnValue(qb as any);

    const result = await service.getSalesAnalysisResume('company-1');

    expect(repository.createQueryBuilder).toHaveBeenCalledWith('currentTransactions');
    expect(qb.leftJoin).toHaveBeenCalled();
    expect(qb.getRawOne).toHaveBeenCalled();
    expect(result).toEqual(
      expect.objectContaining({
        currentTotal: 100,
        currentQuantity: 4,
      }),
    );
  });

  it('should compute sales quantity by month without user filter', async () => {
    repository.count.mockResolvedValue(2);

    const result = await service.getQuantitySalesByMonth('company-1');

    expect(repository.count).toHaveBeenCalledTimes(12);
    expect(repository.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          companyId: 'company-1',
        }),
      }),
    );
    expect(result).toHaveLength(12);
  });

  it('should compute sales quantity by month with user filter', async () => {
    repository.count.mockResolvedValue(0);

    await service.getQuantitySalesByMonth('company-1', 'user-1');

    expect(repository.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: 'user-1',
        }),
      }),
    );
  });
});
