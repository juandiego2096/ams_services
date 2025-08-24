import { Body, Controller, Param, Post, Request, UseGuards, HttpException, HttpStatus, Get, Patch } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { AuthGuard } from '../auth/auth.guard';
import { createAnimalTransactionDto } from './transaction.type';
import { ROLES } from '@constants/roles';
import { STATUS, TRANSACTION_STATUS, TRANSACTION_TYPES } from '@constants/animals';
import { AnimalService } from '../animal/animal.service';
import { TransactionEntity } from '@entities/transaction.entity';
import { FileEntity } from '@entities/file.entity';
import { FileService } from '../file/file.service';
import { createNotificationDto } from '../notification/notification.type';
import { NOTIFICATION_TYPES } from '@constants/notifications';
import { NotificationsService } from '../notification/notification.service';

@UseGuards(AuthGuard)
@Controller('transactions/:companyId')
export class TransactionController {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly animalService: AnimalService,
    private readonly fileService: FileService,
    private readonly notificationService: NotificationsService,
  ) {}

  @Post('createReservation')
  async createReservation(
    @Request() req,
    @Param('companyId') companyId: string,
    @Body() createTransaction: createAnimalTransactionDto,
  ): Promise<TransactionEntity> {
    if (!createTransaction.animalId) throw new HttpException('animalId field is required', HttpStatus.BAD_REQUEST);
    if (!createTransaction.details || createTransaction.details.trim() === '')
      throw new HttpException('details field is required and can not be empty', HttpStatus.BAD_REQUEST);

    if (req.userRole !== ROLES.SELLER) {
      throw new HttpException('User not enabled to create a reservation', HttpStatus.UNAUTHORIZED);
    }

    const animal = await this.animalService.getAnimalById(createTransaction.animalId, companyId);
    if (!animal) throw new HttpException('Animal not found', HttpStatus.NOT_FOUND);

    const pendingTransaction = await this.transactionService.getTransactionsByAnimalId(
      [TRANSACTION_TYPES.RESERVATION],
      [TRANSACTION_STATUS.PENDING],
      createTransaction.animalId,
    );
    if (pendingTransaction.length > 0) throw new HttpException('This animal has a pending reservation', HttpStatus.NOT_FOUND);

    const transactionPictures: FileEntity[] = [];
    for (const element of createTransaction.pictures) {
      const file = await this.fileService.getFile(element);
      if (file) transactionPictures.push(file);
    }

    createTransaction.type = TRANSACTION_TYPES.RESERVATION;
    createTransaction.userId = req.userId;
    createTransaction.companyId = companyId;
    const newTransaction = await this.transactionService.createTransaction(createTransaction, transactionPictures);
    if (newTransaction) {
      const newNotification: createNotificationDto = {
        companyId: companyId,
        type: NOTIFICATION_TYPES.NEW_RESERVATION,
        url: `/reservation/${newTransaction.id}`,
        date: new Date(),
      };

      this.notificationService.createNotification(newNotification);
    }
    return newTransaction;
  }

  @Post('createSell')
  async createSell(@Request() req, @Param('companyId') companyId: string, @Body() createTransaction: createAnimalTransactionDto): Promise<TransactionEntity> {
    if (!createTransaction.animalId) throw new HttpException('animalId field is required', HttpStatus.BAD_REQUEST);
    if (!createTransaction.details || createTransaction.details.trim() === '')
      throw new HttpException('details field is required and can not be empty', HttpStatus.BAD_REQUEST);
    if (!createTransaction.totalTransaction || createTransaction.totalTransaction === 0)
      throw new HttpException('totalTransaction field is required and can not be zero', HttpStatus.BAD_REQUEST);

    if (req.userRole !== ROLES.SELLER) {
      throw new HttpException('User not enabled to create a reservation', HttpStatus.UNAUTHORIZED);
    }

    const animal = await this.animalService.getAnimalById(createTransaction.animalId, companyId);
    if (!animal) throw new HttpException('Animal not found', HttpStatus.NOT_FOUND);

    const pendingTransaction = await this.transactionService.getTransactionsByAnimalId(
      [TRANSACTION_TYPES.SELL],
      [TRANSACTION_STATUS.PENDING],
      createTransaction.animalId,
    );
    if (pendingTransaction.length > 0) throw new HttpException('This animal has a pending sell', HttpStatus.NOT_FOUND);

    const transactionPictures: FileEntity[] = [];
    for (const element of createTransaction.pictures) {
      const file = await this.fileService.getFile(element);
      if (file) transactionPictures.push(file);
    }

    createTransaction.type = TRANSACTION_TYPES.SELL;
    createTransaction.userId = req.userId;
    createTransaction.companyId = companyId;
    const newTransaction = await this.transactionService.createTransaction(createTransaction, transactionPictures);
    if (newTransaction) {
      const newNotification: createNotificationDto = {
        companyId: companyId,
        type: NOTIFICATION_TYPES.NEW_SELL,
        url: `/sale/${newTransaction.id}`,
        date: new Date(),
      };

      this.notificationService.createNotification(newNotification);
    }
    return newTransaction;
  }

  @Patch('acceptTransaction/:transactionId')
  async acceptTransaction(@Request() req, @Param('companyId') companyId: string, @Param('transactionId') transactionId: string): Promise<TransactionEntity> {
    if (req.userRole !== ROLES.ADMIN) {
      throw new HttpException('User not enabled to accept a transaction', HttpStatus.UNAUTHORIZED);
    }

    const transaction = await this.transactionService.getTransactionById(transactionId);
    if (!transaction) throw new HttpException('Transaction not found', HttpStatus.NOT_FOUND);

    const animal = await this.animalService.getAnimalById(transaction.animalId, companyId);
    if (!animal) throw new HttpException('Animal not found', HttpStatus.NOT_FOUND);

    let reservation: TransactionEntity | null = null;
    if (transaction.parentTransactionId) {
      reservation = await this.transactionService.getTransactionById(transaction.parentTransactionId);
      if (!reservation) throw new HttpException('Parent reservation not found', HttpStatus.NOT_FOUND);
    }

    transaction.lastUpdatedDate = new Date();
    transaction.lastUpdatedUserId = req.userId;
    transaction.status = TRANSACTION_STATUS.ACCEPTED;
    const acceptedTransaction = await this.transactionService.updateTransaction(transaction);

    animal.status = transaction.type === TRANSACTION_TYPES.RESERVATION ? STATUS.RESERVED : STATUS.SOLD;
    await this.animalService.updateAnimal(animal);

    if (reservation) {
      reservation.status = TRANSACTION_STATUS.CLOSED;
      await this.transactionService.updateTransaction(reservation);
    }
    if (acceptedTransaction) {
      const newNotification: createNotificationDto = {
        companyId: companyId,
        type: transaction.type === TRANSACTION_TYPES.RESERVATION ? NOTIFICATION_TYPES.RESERVATION_CONFIRMATION : NOTIFICATION_TYPES.SELL_CONFIRMATION,
        url: `/available/${acceptedTransaction.animalId}`,
        date: new Date(),
      };

      this.notificationService.createUserNotification(newNotification, acceptedTransaction.userId);
    }
    return acceptedTransaction;
  }

  @Patch('rejectTransaction/:transactionId')
  async rejectTransaction(@Request() req, @Param('companyId') companyId: string, @Param('transactionId') transactionId: string): Promise<TransactionEntity> {
    if (req.userRole !== ROLES.ADMIN) {
      throw new HttpException('User not enabled to accept a transaction', HttpStatus.UNAUTHORIZED);
    }

    const transaction = await this.transactionService.getTransactionById(transactionId);
    if (!transaction) throw new HttpException('Transaction not found', HttpStatus.NOT_FOUND);
    if (transaction.status != TRANSACTION_STATUS.PENDING) throw new HttpException('This transaction is already closed', HttpStatus.CONFLICT);

    transaction.lastUpdatedDate = new Date();
    transaction.lastUpdatedUserId = req.userId;
    transaction.status = TRANSACTION_STATUS.REJECTED;
    const rejectedTransaction = await this.transactionService.updateTransaction(transaction);
    if (rejectedTransaction) {
      const newNotification: createNotificationDto = {
        companyId: companyId,
        type: transaction.type === TRANSACTION_TYPES.RESERVATION ? NOTIFICATION_TYPES.RESERVATION_REJECTION : NOTIFICATION_TYPES.SELL_REJECTION,
        url: `/available/${rejectedTransaction.animalId}`,
        date: new Date(),
      };

      this.notificationService.createUserNotification(newNotification, rejectedTransaction.userId);
    }
    return rejectedTransaction;
  }

  @Get('getTransactionById/:transactionId')
  async getTransactionById(@Param('transactionId') transactionId: string): Promise<TransactionEntity | null> {
    return await this.transactionService.getTransactionById(transactionId);
  }

  @Get('getTransactionByAnimalId/:animalId')
  async getTransactionByAnimalId(@Param('companyId') companyId: string, @Param('animalId') animalId: string): Promise<TransactionEntity[]> {
    return await this.transactionService.getTransactionsByAnimalId([TRANSACTION_TYPES.RESERVATION], [TRANSACTION_STATUS.PENDING], animalId);
  }

  @Get('getAllReservations')
  async getAllReservations(@Param('companyId') companyId: string): Promise<TransactionEntity[]> {
    return await this.transactionService.getAllTransactions(companyId, TRANSACTION_TYPES.RESERVATION);
  }

  @Get('getAllSelfReservations')
  async getAllSelfReservations(@Request() req): Promise<TransactionEntity[]> {
    return await this.transactionService.getAllTransactionsByUserId(TRANSACTION_TYPES.RESERVATION, req.userId);
  }

  @Get('getActiveReservations')
  async getActiveReservations(@Param('companyId') companyId: string): Promise<TransactionEntity[]> {
    return await this.transactionService.getTransactions(companyId, TRANSACTION_TYPES.RESERVATION, [TRANSACTION_STATUS.PENDING, TRANSACTION_STATUS.ACCEPTED]);
  }

  @Get('getPendingReservations')
  async getPendingReservations(@Param('companyId') companyId: string): Promise<TransactionEntity[]> {
    return await this.transactionService.getTransactions(companyId, TRANSACTION_TYPES.RESERVATION, [TRANSACTION_STATUS.PENDING]);
  }

  @Get('getSelfActiveReservations')
  async getSelfPendingReservations(@Request() req): Promise<TransactionEntity[]> {
    return await this.transactionService.getTransactionsByUserId(
      TRANSACTION_TYPES.RESERVATION,
      [TRANSACTION_STATUS.PENDING, TRANSACTION_STATUS.ACCEPTED],
      req.userId,
    );
  }

  @Get('getAllSales')
  async getAllSales(@Param('companyId') companyId: string): Promise<TransactionEntity[]> {
    return await this.transactionService.getAllTransactions(companyId, TRANSACTION_TYPES.SELL);
  }

  @Get('getAllSelfSales')
  async getAllSelfSales(@Request() req): Promise<TransactionEntity[]> {
    return await this.transactionService.getAllTransactionsByUserId(TRANSACTION_TYPES.SELL, req.userId);
  }

  @Get('getActiveSales')
  async getActiveSales(@Param('companyId') companyId: string): Promise<TransactionEntity[]> {
    return await this.transactionService.getTransactions(companyId, TRANSACTION_TYPES.SELL, [TRANSACTION_STATUS.PENDING, TRANSACTION_STATUS.ACCEPTED]);
  }

  @Get('getSelfActiveSales')
  async getSelfActiveSales(@Request() req): Promise<TransactionEntity[]> {
    return await this.transactionService.getTransactionsByUserId(TRANSACTION_TYPES.SELL, [TRANSACTION_STATUS.PENDING, TRANSACTION_STATUS.ACCEPTED], req.userId);
  }

  @Get('getAcceptedSales')
  async getAcceptedSales(@Param('companyId') companyId: string): Promise<TransactionEntity[]> {
    return await this.transactionService.getTransactions(companyId, TRANSACTION_TYPES.SELL, [TRANSACTION_STATUS.ACCEPTED]);
  }

  @Get('getSelfAcceptedSales')
  async getSelfAcceptedSales(@Request() req): Promise<TransactionEntity[]> {
    return await this.transactionService.getTransactionsByUserId(TRANSACTION_TYPES.SELL, [TRANSACTION_STATUS.ACCEPTED], req.userId);
  }
}
