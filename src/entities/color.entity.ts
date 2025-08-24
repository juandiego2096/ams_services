import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { tableNames } from '@constants/table.names';
import { UserEntity } from '@entities/user.entity';
import { AnimalEntity } from '@entities/animal.entity';

@Entity({ name: tableNames.color })
export class ColorEntity {
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

  @ManyToOne(() => UserEntity, (UserEntity) => UserEntity.colors)
  @JoinColumn({ name: 'createdBy' })
  colorCreationUser: UserEntity;

  @OneToMany(() => AnimalEntity, (animal) => animal.color)
  animals: AnimalEntity[];
}
