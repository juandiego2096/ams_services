import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { tableNames } from '@constants/table.names';
import { CompanyEntity } from '@entities/company.entity';
import { ROLES } from '@constants/roles';
import { ColorEntity } from '@entities/color.entity';
import { SpecieEntity } from '@entities/specie.entity';
import { BreedEntity } from '@entities/breed.entity';

@Entity({ name: tableNames.user })
export class UserEntity {
  constructor(
    id: string,
    role: ROLES,
    username: string,
    password: string,
    name: string,
    lastname: string,
    creationDate: Date,
    email: string,
    phone: string,
    address: string,
    companyId: string,
    active: boolean,
  ) {
    this.id = id;
    this.role = role;
    this.username = username;
    this.password = password;
    this.name = name;
    this.lastname = lastname;
    this.creationDate = creationDate;
    this.email = email;
    this.phone = phone;
    this.address = address;
    this.companyId = companyId;
    this.active = active;
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ROLES, nullable: false })
  role: ROLES;

  @Column({ nullable: false, unique: true })
  username: string;

  @Column({ nullable: false })
  password: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  lastname: string;

  @Column({ nullable: false, type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  creationDate: Date;

  @Column({ nullable: true, unique: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  companyId: string;

  @Column({ default: true, nullable: false })
  active: boolean;

  @ManyToOne(() => CompanyEntity, (CompanyEntity) => CompanyEntity.company)
  company: CompanyEntity;

  @OneToMany(() => ColorEntity, (ColorEntity) => ColorEntity.colorCreationUser)
  colors: ColorEntity[];

  @OneToMany(() => SpecieEntity, (SpecieEntity) => SpecieEntity.specieCreationUser)
  species: SpecieEntity[];

  @OneToMany(() => BreedEntity, (BreedEntity) => BreedEntity.breedCreationUser)
  breeds: BreedEntity[];
}
