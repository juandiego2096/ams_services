import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionEntity } from '@entities/transaction.entity';
import { In, Repository } from 'typeorm';
import { TRANSACTION_STATUS, TRANSACTION_TYPES } from '@constants/animals';
import { createAnimalTransactionDto } from './transaction.type';
import { FileEntity } from '@entities/file.entity';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(TransactionEntity)
    private readonly transactionRepository: Repository<TransactionEntity>,
  ) {}

  async createTransaction(transaction: createAnimalTransactionDto, transactionPictures: FileEntity[] = []): Promise<TransactionEntity> {
    transaction.status = TRANSACTION_STATUS.PENDING;
    return this.transactionRepository.save({
      type: transaction.type,
      status: transaction.status,
      animalId: transaction.animalId,
      userId: transaction.userId,
      lastUpdatedUserId: transaction.lastUpdatedUserId,
      details: transaction.details,
      totalTransaction: transaction.totalTransaction,
      pictures: transactionPictures,
      parentTransactionId: transaction.parentTransactionId,
      companyId: transaction.companyId,
    });
  }

  async updateTransaction(transaction: TransactionEntity) {
    return this.transactionRepository.save(transaction);
  }

  async getTransactionById(
    transactionId: string,
    transactionPicturesRelation = true,
    animalPicturesRelation = true,
    parentTransactionRelation = true,
  ): Promise<TransactionEntity | null> {
    const relations: string[] = ['animal', 'transactionUser', 'lastUpdatedUser'];
    if (animalPicturesRelation) relations.push('animal.pictures');
    if (transactionPicturesRelation) relations.push('pictures');
    if (parentTransactionRelation) {
      relations.push('parentTransaction');
      relations.push('parentTransaction.transactionUser');
      relations.push('parentTransaction.lastUpdatedUser');
      relations.push('parentTransaction.pictures');
    }

    return this.transactionRepository.findOne({
      where: {
        id: transactionId,
      },
      relations: relations,
    });
  }

  async getTransactions(
    companyId: string,
    type: TRANSACTION_TYPES,
    status: TRANSACTION_STATUS[],
    animalPicturesRelation = true,
    animalBreedRelation = true,
    animalColorRelation = true,
    animalSpecieRelation = true,
  ): Promise<TransactionEntity[]> {
    const relations: string[] = ['animal', 'transactionUser', 'lastUpdatedUser'];
    if (animalPicturesRelation) relations.push('animal.pictures');
    if (animalBreedRelation) relations.push('animal.breed');
    if (animalBreedRelation) relations.push('animal.breed.picture');
    if (animalColorRelation) relations.push('animal.color');
    if (animalSpecieRelation) relations.push('animal.specie');

    return this.transactionRepository.find({
      where: {
        type: type,
        status: In(status),
        companyId: companyId,
      },
      order: { creationDate: 'DESC' },
      relations: relations,
    });
  }

  async getAllTransactions(companyId: string, type: TRANSACTION_TYPES): Promise<TransactionEntity[]> {
    const relations: string[] = ['animal', 'transactionUser', 'lastUpdatedUser'];

    return this.transactionRepository.find({
      where: {
        type: type,
        companyId: companyId,
      },
      order: { creationDate: 'DESC' },
      relations: relations,
    });
  }

  async getTransactionsByUserId(
    type: TRANSACTION_TYPES,
    status: TRANSACTION_STATUS[],
    userId: string,
    animalPicturesRelation = true,
    animalBreedRelation = true,
    animalColorRelation = true,
    animalSpecieRelation = true,
  ): Promise<TransactionEntity[]> {
    const relations: string[] = ['animal', 'transactionUser', 'lastUpdatedUser'];
    if (animalPicturesRelation) relations.push('animal.pictures');
    if (animalBreedRelation) relations.push('animal.breed');
    if (animalBreedRelation) relations.push('animal.breed.picture');
    if (animalColorRelation) relations.push('animal.color');
    if (animalSpecieRelation) relations.push('animal.specie');

    return this.transactionRepository.find({
      where: {
        type: type,
        status: In(status),
        userId: userId,
      },
      order: { creationDate: 'DESC' },
      relations: relations,
    });
  }

  async getTransactionsByAnimalId(type: TRANSACTION_TYPES[], status: TRANSACTION_STATUS[], animalId: string): Promise<TransactionEntity[]> {
    const relations: string[] = ['animal', 'transactionUser', 'lastUpdatedUser'];

    return this.transactionRepository.find({
      where: {
        type: In(type),
        status: In(status),
        animalId: animalId,
      },
      order: { creationDate: 'DESC' },
      relations: relations,
    });
  }

  async getAllTransactionsByUserId(type: TRANSACTION_TYPES, userId: string): Promise<TransactionEntity[]> {
    const relations: string[] = ['animal'];

    return this.transactionRepository.find({
      where: {
        type: type,
        userId: userId,
      },
      order: { creationDate: 'DESC' },
      relations: relations,
    });
  }
}
