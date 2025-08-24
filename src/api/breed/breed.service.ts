import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BreedEntity } from '@entities/breed.entity';
import { createBreedDto } from './breed.type';

@Injectable()
export class BreedService {
  constructor(
    @InjectRepository(BreedEntity)
    private readonly breedRepository: Repository<BreedEntity>,
    private readonly configService: ConfigService,
  ) {}

  async getBreedsBySpecieId(specieId: string, specieRelation = true): Promise<BreedEntity[]> {
    const relations: string[] = [];
    if (specieRelation) relations.push('specie');
    return this.breedRepository.find({ where: { specieId: specieId }, relations: relations });
  }

  async getBreeds(specieRelation = true): Promise<BreedEntity[]> {
    const relations: string[] = [];
    if (specieRelation) relations.push('specie');
    return this.breedRepository.find({ relations: relations });
  }

  async getBreedById(breedId: string, specieRelation = true, userRelation = true): Promise<BreedEntity | null> {
    const relations: string[] = [];
    if (specieRelation) relations.push('specie');
    if (userRelation) relations.push('breedCreationUser');
    return this.breedRepository.findOne({ where: { id: breedId }, relations: relations });
  }

  async createBreed(breed: createBreedDto): Promise<BreedEntity> {
    return this.breedRepository.save({
      name: breed.name,
      specieId: breed.specieId,
      active: breed.active,
      pictureId: breed.pictureId,
      createdBy: breed.createdBy,
    });
  }

  async updateBreed(breed: BreedEntity) {
    return this.breedRepository.save(breed);
  }

  async getAnimalsByStatusGroupByBreed(companyId: string, status: number): Promise<BreedEntity[]> {
    return this.breedRepository
      .createQueryBuilder('breeds')
      .leftJoinAndSelect('breeds.animals', 'animals', 'animals.status = :status AND animals.companyId = :companyId', { status: status, companyId: companyId })
      .leftJoinAndSelect('animals.specie', 'specie')
      .leftJoinAndSelect('animals.color', 'color')
      .leftJoinAndSelect('animals.breed', 'breed')
      .leftJoinAndSelect('breed.picture', 'picture')
      .where('breeds.active = 1')
      .getMany();
  }
}
