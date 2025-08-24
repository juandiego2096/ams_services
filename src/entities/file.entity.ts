import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { tableNames } from '@constants/table.names';

@Entity({ name: tableNames.file })
export class FileEntity {
  constructor(id: string, filename: string, type: string, creationDate: Date, companyId: string, linked: boolean) {
    this.id = id;
    this.filename = filename;
    this.type = type;
    this.creationDate = creationDate;
    this.companyId = companyId;
    this.linked = linked;
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  filename: string;

  @Column({ nullable: false })
  type: string;

  @Column({ nullable: false, type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  creationDate: Date;

  @Column({ nullable: false })
  companyId: string;

  @Column({ nullable: false, default: false })
  linked: boolean;
}
