import { Column, Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn, JoinTable, OneToMany } from 'typeorm';
import { tableNames } from '@constants/table.names';
import { CompanyEntity } from '@entities/company.entity';
import { FileEntity } from '@entities/file.entity';
import { SpecieEntity } from '@entities/specie.entity';
import { BreedEntity } from '@entities/breed.entity';
import { ColorEntity } from '@entities/color.entity';
import { TransactionEntity } from '@entities/transaction.entity';
import { GENDERS } from '@constants/animals';

@Entity({ name: tableNames.animal })
export class AnimalEntity {
  constructor(
    id: string,
    status: number,
    specieId: string,
    breedId: string,
    colorId: string,
    birthDate: Date,
    creationDate: Date,
    companyId: string,
    gender: GENDERS,
    price: number,
    pictures: FileEntity[],
  ) {
    this.id = id;
    this.status = status;
    this.specieId = specieId;
    this.breedId = breedId;
    this.colorId = colorId;
    this.birthDate = birthDate;
    this.creationDate = creationDate;
    this.companyId = companyId;
    this.gender = gender;
    this.price = price;
    this.pictures = pictures;
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  status: number;

  @Column({ nullable: false })
  specieId: string;

  @Column({ type: 'enum', enum: GENDERS, nullable: false })
  gender: GENDERS;

  @Column({ nullable: false })
  breedId: string;

  @Column({ nullable: true })
  colorId: string;

  @Column({ nullable: false, type: 'datetime' })
  birthDate: Date;

  @Column({ nullable: false, type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  creationDate: Date;

  @Column({ nullable: false })
  price: number;

  @Column({ nullable: true })
  companyId: string;

  @ManyToOne(() => CompanyEntity, (CompanyEntity) => CompanyEntity.animals)
  animals: CompanyEntity;

  @ManyToMany(() => FileEntity, { cascade: true })
  @JoinTable({ name: 'animal_file' })
  pictures: FileEntity[];

  @ManyToOne(() => SpecieEntity, (specie) => specie.animals)
  specie: SpecieEntity;

  @ManyToOne(() => BreedEntity, (breed) => breed.animals)
  breed: BreedEntity;

  @ManyToOne(() => ColorEntity, (color) => color.animals)
  color: ColorEntity;

  @OneToMany(() => TransactionEntity, (transaction) => transaction.animal)
  transactions: TransactionEntity[];
}
