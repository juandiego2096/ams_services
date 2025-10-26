import { Test, TestingModule } from '@nestjs/testing';
import { TransactionService } from './transaction.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TransactionEntity } from '@entities/transaction.entity';
import { Repository, In } from 'typeorm';
import { createAnimalTransactionDto } from './transaction.type';
import { TRANSACTION_STATUS, TRANSACTION_TYPES } from '@constants/animals';
import { FileEntity } from '@entities/file.entity';

describe('TransactionService', () => {
  let service: TransactionService;
  let repository: jest.Mocked<Repository<TransactionEntity>>;

  beforeEach(async () => {
    const repositoryMock: Partial<jest.Mocked<Repository<TransactionEntity>>> = {
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        { provide: getRepositoryToken(TransactionEntity), useValue: repositoryMock },
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
    repository = module.get(getRepositoryToken(TransactionEntity));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create transactions forcing status to pending', async () => {
    const dto: createAnimalTransactionDto = {
      type: TRANSACTION_TYPES.RESERVATION,
      status: TRANSACTION_STATUS.ACCEPTED,
      animalId: 'animal-1',
      userId: 'user-1',
      lastUpdatedUserId: 'user-2',
      details: 'details',
      totalTransaction: 500,
      pictures: [],
      parentTransactionId: 'parent-transaction',
      companyId: 'company-1',
    };

    const pictures = [{ id: 'file-1' } as FileEntity];
    const persisted = { id: 'transaction-1' } as TransactionEntity;
    repository.save.mockResolvedValue(persisted);

    const result = await service.createTransaction({ ...dto }, pictures);

    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        status: TRANSACTION_STATUS.PENDING,
        type: dto.type,
        pictures,
      }),
    );
    expect(result).toBe(persisted);
  });

  it('should filter transactions by type, status and company when listing', async () => {
    repository.find.mockResolvedValue([]);

    await service.getTransactions('company-1', TRANSACTION_TYPES.RESERVATION, [TRANSACTION_STATUS.PENDING]);

    expect(repository.find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          type: TRANSACTION_TYPES.RESERVATION,
          status: In([TRANSACTION_STATUS.PENDING]),
          companyId: 'company-1',
        }),
      }),
    );
  });

  it('should filter by animal id when searching transactions for a specific animal', async () => {
    repository.find.mockResolvedValue([]);

    await service.getTransactionsByAnimalId([TRANSACTION_TYPES.RESERVATION], [TRANSACTION_STATUS.ACCEPTED], 'animal-1');

    expect(repository.find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          type: In([TRANSACTION_TYPES.RESERVATION]),
          status: In([TRANSACTION_STATUS.ACCEPTED]),
          animalId: 'animal-1',
        }),
      }),
    );
  });
});
