import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { tableNames } from '@constants/table.names';
import { SpecieEntity } from '@entities/specie.entity';
import { AnimalEntity } from '@entities/animal.entity';
import { FileEntity } from '@entities/file.entity';
import { UserEntity } from '@entities/user.entity';

@Entity({ name: tableNames.breed })
export class BreedEntity {
  constructor(id: string, name: string, specieId: string, pictureId: string, active: boolean, createdBy: string) {
    this.id = id;
    this.name = name;
    this.specieId = specieId;
    this.active = active;
    this.pictureId = pictureId;
    this.createdBy = createdBy;
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, unique: true })
  name: string;

  @Column({ nullable: false })
  specieId: string;

  @Column({ nullable: true })
  pictureId: string;

  @Column({ nullable: false, default: true })
  active: boolean;

  @Column({ nullable: true })
  createdBy: string;

  @ManyToOne(() => SpecieEntity, (specie) => specie.breeds)
  specie: SpecieEntity;

  @ManyToOne(() => UserEntity, (UserEntity) => UserEntity.breeds)
  @JoinColumn({ name: 'createdBy' })
  breedCreationUser: UserEntity;

  @OneToMany(() => AnimalEntity, (animal) => animal.breed)
  animals: AnimalEntity[];

  @ManyToOne(() => FileEntity, { cascade: true })
  picture: FileEntity;
}
