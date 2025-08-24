import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { tableNames } from '@constants/table.names';
import { UserEntity } from '@entities/user.entity';
import { AnimalEntity } from '@entities/animal.entity';

@Entity({ name: tableNames.company })
export class CompanyEntity {
  constructor(id: string, name: string, creationDate: Date, createdBy: string, email: string, phone: string, address: string) {
    this.id = id;
    this.name = name;
    this.creationDate = creationDate;
    this.createdBy = createdBy;
    this.email = email;
    this.phone = phone;
    this.address = address;
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false, type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  creationDate: Date;

  @Column({ nullable: false })
  createdBy: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  address: string;

  @OneToMany(() => UserEntity, (UserEntity) => UserEntity.company)
  company: UserEntity;

  @OneToMany(() => AnimalEntity, (AnimalEntity) => AnimalEntity.animals)
  animals: AnimalEntity[];
}
