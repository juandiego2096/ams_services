import { Test, TestingModule } from '@nestjs/testing';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { AnimalService } from '../animal/animal.service';
import { FileService } from '../file/file.service';
import { NotificationsService } from '../notification/notification.service';
import { TRANSACTION_STATUS, TRANSACTION_TYPES, STATUS } from '@constants/animals';
import { NOTIFICATION_TYPES } from '@constants/notifications';
import { ROLES } from '@constants/roles';
import { createAnimalTransactionDto } from './transaction.type';
import { FileEntity } from '@entities/file.entity';
import { AnimalEntity } from '@entities/animal.entity';
import { TransactionEntity } from '@entities/transaction.entity';
import { HttpException } from '@nestjs/common';
import { createNotificationDto } from '../notification/notification.type';
import { AuthGuard } from '../auth/auth.guard';

describe('TransactionController', () => {
  let controller: TransactionController;
  let transactionService: jest.Mocked<TransactionService>;
  let animalService: jest.Mocked<AnimalService>;
  let fileService: jest.Mocked<FileService>;
  let notificationService: jest.Mocked<NotificationsService>;

  beforeEach(async () => {
    const moduleBuilder = Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        {
          provide: TransactionService,
          useValue: {
            createTransaction: jest.fn(),
            getTransactionsByAnimalId: jest.fn(),
            updateTransaction: jest.fn(),
            getTransactionById: jest.fn(),
          },
        },
        {
          provide: AnimalService,
          useValue: {
            getAnimalById: jest.fn(),
            updateAnimal: jest.fn(),
          },
        },
        {
          provide: FileService,
          useValue: {
            getFile: jest.fn(),
          },
        },
        {
          provide: NotificationsService,
          useValue: {
            createNotification: jest.fn(),
            createUserNotification: jest.fn(),
          },
        },
      ],
    });

    const module: TestingModule = await moduleBuilder
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<TransactionController>(TransactionController);
    transactionService = module.get(TransactionService) as jest.Mocked<TransactionService>;
    animalService = module.get(AnimalService) as jest.Mocked<AnimalService>;
    fileService = module.get(FileService) as jest.Mocked<FileService>;
    notificationService = module.get(NotificationsService) as jest.Mocked<NotificationsService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createReservation', () => {
    it('should persist reservation, hydrate pictures and notify', async () => {
      const req = { userRole: ROLES.SELLER, userId: 'user-1' };
      const dto: createAnimalTransactionDto = {
        animalId: 'animal-1',
        details: 'Reservation details',
        pictures: ['file-1'],
        type: TRANSACTION_TYPES.SELL,
        status: TRANSACTION_STATUS.ACCEPTED,
        userId: 'initial-user',
        lastUpdatedUserId: 'last-user',
        totalTransaction: 500,
        parentTransactionId: 'parent-transaction',
        companyId: 'other-company',
      };

      const companyId = 'company-1';
      const animal = { id: 'animal-1', status: STATUS.AVAILABLE } as AnimalEntity;
      const file = { id: 'file-1' } as FileEntity;
      const newTransaction = { id: 'transaction-1' } as TransactionEntity;

      animalService.getAnimalById.mockResolvedValue(animal);
      transactionService.getTransactionsByAnimalId.mockResolvedValue([]);
      fileService.getFile.mockResolvedValue(file);
      transactionService.createTransaction.mockResolvedValue(newTransaction);

      const result = await controller.createReservation(req, companyId, { ...dto });

      expect(transactionService.getTransactionsByAnimalId).toHaveBeenCalledWith(
        [TRANSACTION_TYPES.RESERVATION],
        [TRANSACTION_STATUS.PENDING],
        dto.animalId,
      );
      expect(fileService.getFile).toHaveBeenCalledWith('file-1');
      expect(transactionService.createTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          type: TRANSACTION_TYPES.RESERVATION,
          userId: req.userId,
          companyId,
        }),
        [file],
      );
      expect(notificationService.createNotification).toHaveBeenCalledWith(
        expect.objectContaining<createNotificationDto>({
          companyId,
          type: NOTIFICATION_TYPES.NEW_RESERVATION,
          url: `/reservation/${newTransaction.id}`,
          date: expect.any(Date),
        }),
      );
      expect(result).toBe(newTransaction);
    });

    it('should reject reservations for non seller users', async () => {
      const req = { userRole: ROLES.ADMIN, userId: 'user-1' };

      await expect(
        controller.createReservation(req, 'company-1', {
          animalId: 'animal-1',
          details: 'Reservation',
          pictures: [],
          type: TRANSACTION_TYPES.SELL,
          status: TRANSACTION_STATUS.PENDING,
          userId: 'user-1',
          lastUpdatedUserId: 'last-user',
          totalTransaction: 100,
          parentTransactionId: 'parent',
          companyId: 'company-1',
        }),
      ).rejects.toBeInstanceOf(HttpException);

      expect(transactionService.createTransaction).not.toHaveBeenCalled();
    });
  });

  describe('createSell', () => {
    it('should throw when totalTransaction is missing', async () => {
      const req = { userRole: ROLES.SELLER, userId: 'user-1' };

      await expect(
        controller.createSell(req, 'company-1', {
          animalId: 'animal-1',
          details: 'Sell details',
          totalTransaction: 0,
          pictures: [],
          type: TRANSACTION_TYPES.RESERVATION,
          status: TRANSACTION_STATUS.PENDING,
          userId: 'user-1',
          lastUpdatedUserId: 'last-user',
          parentTransactionId: 'parent',
          companyId: 'company-1',
        }),
      ).rejects.toBeInstanceOf(HttpException);
    });
  });
});
