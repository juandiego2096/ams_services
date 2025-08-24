import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { tableNames } from '@constants/table.names';
import { BreedEntity } from '@entities/breed.entity';
import { UserEntity } from '@entities/user.entity';
import { AnimalEntity } from '@entities/animal.entity';

@Entity({ name: tableNames.specie })
export class SpecieEntity {
  constructor(id: string, name: string, active: boolean, createdBy: string) {
    this.id = id;
    this.name = name;
    this.active = active;
    this.createdBy = createdBy;
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, unique: true })
  name: string;

  @Column({ nullable: false, default: true })
  active: boolean;

  @Column({ nullable: false })
  createdBy: string;

  @OneToMany(() => BreedEntity, (breed) => breed.specie)
  breeds: BreedEntity[];

  @ManyToOne(() => UserEntity, (UserEntity) => UserEntity.species)
  @JoinColumn({ name: 'createdBy' })
  specieCreationUser: UserEntity;

  @OneToMany(() => AnimalEntity, (animal) => animal.specie)
  animals: AnimalEntity[];
}
