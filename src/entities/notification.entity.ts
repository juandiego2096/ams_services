import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { tableNames } from '@constants/table.names';
import { NOTIFICATION_TYPES } from '@constants/notifications';

@Entity({ name: tableNames.notification })
export class NotificationEntity {
  constructor(id: string, companyId: string, userId: string, creationDate: Date, type: NOTIFICATION_TYPES, read: boolean, url: string) {
    this.id = id;
    this.companyId = companyId;
    this.userId = userId;
    this.creationDate = creationDate;
    this.type = type;
    this.read = read;
    this.url = url;
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  companyId: string;

  @Column({ nullable: false })
  userId: string;

  @Column({ nullable: false, type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  creationDate: Date;

  @Column({ nullable: false })
  type: NOTIFICATION_TYPES;

  @Column({ nullable: false, default: false })
  read: boolean;

  @Column({ nullable: true })
  url: string;
}
