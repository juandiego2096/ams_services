import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { tableNames } from '@constants/table.names';
import { AnimalEntity } from '@entities/animal.entity';
import { FileEntity } from '@entities/file.entity';
import { TRANSACTION_STATUS, TRANSACTION_TYPES } from '@constants/animals';
import { UserEntity } from '@entities/user.entity';

@Entity({ name: tableNames.transaction })
export class TransactionEntity {
  constructor(
    id: string,
    type: TRANSACTION_TYPES,
    status: TRANSACTION_STATUS,
    animalId: string,
    details: string,
    userId: string,
    creationDate: Date,
    lastUpdatedUserId: string,
    lastUpdatedDate: Date,
    totalTransaction: number,
    companyId: string,
  ) {
    this.id = id;
    this.type = type;
    this.status = status;
    this.animalId = animalId;
    this.details = details;
    this.userId = userId;
    this.creationDate = creationDate;
    this.lastUpdatedUserId = lastUpdatedUserId;
    this.lastUpdatedDate = lastUpdatedDate;
    this.totalTransaction = totalTransaction;
    this.companyId = companyId;
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: TRANSACTION_TYPES, nullable: false })
  type: TRANSACTION_TYPES;

  @Column({ type: 'enum', enum: TRANSACTION_STATUS, nullable: false })
  status: TRANSACTION_STATUS;

  @Column({ nullable: false })
  animalId: string;

  @Column()
  details: string;

  @Column({ nullable: false, type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  creationDate: Date;

  @Column({ nullable: false })
  userId: string;

  @Column({ nullable: true })
  lastUpdatedUserId: string;

  @Column({ nullable: false, type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  lastUpdatedDate: Date;

  @Column({ nullable: false })
  totalTransaction: number;

  @Column({ nullable: true })
  parentTransactionId: string;

  @Column({ nullable: false })
  companyId: string;

  @ManyToOne(() => AnimalEntity, (animal) => animal.transactions)
  @JoinColumn({ name: 'animalId' })
  animal: AnimalEntity;

  @ManyToMany(() => FileEntity, { cascade: true })
  @JoinTable({ name: 'transaction_file' })
  pictures: FileEntity[];

  @OneToOne(() => TransactionEntity)
  @JoinColumn({ name: 'parentTransactionId' })
  parentTransaction: TransactionEntity;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'userId' })
  transactionUser: UserEntity;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'lastUpdatedUserId' })
  lastUpdatedUser: UserEntity;
}
