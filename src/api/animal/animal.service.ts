import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AnimalEntity } from '@entities/animal.entity';
import { Repository } from 'typeorm';
import { createAnimalDto, createAnimalFileDto } from './animal.type';
import { FileEntity } from '@entities/file.entity';

@Injectable()
export class AnimalService {
  constructor(
    @InjectRepository(AnimalEntity)
    private readonly animalRepository: Repository<AnimalEntity>,
  ) {}

  async createAnimal(animal: createAnimalDto, animalPictures: FileEntity[] = []): Promise<AnimalEntity> {
    return await this.animalRepository.save({
      status: animal.status,
      specieId: animal.specieId,
      breedId: animal.breedId,
      colorId: animal.colorId,
      birthDate: new Date(animal.birthDate),
      companyId: animal.companyId,
      gender: animal.gender,
      price: animal.price,
      pictures: animalPictures,
    });
  }

  async updateAnimal(animal: AnimalEntity) {
    return this.animalRepository.save(animal);
  }

  async getAnimals(companyId: string, breedRelation = true, colorRelation = true, specieRelation = true): Promise<AnimalEntity[]> {
    const relations: string[] = [];
    if (breedRelation) relations.push('breed');
    if (colorRelation) relations.push('color');
    if (specieRelation) relations.push('specie');

    return this.animalRepository.find({
      where: {
        companyId: companyId,
      },
      order: { creationDate: 'DESC' },
      relations: relations,
    });
  }

  async getAnimalsByStatus(
    companyId: string,
    status: number,
    picturesRelation = true,
    breedRelation = true,
    colorRelation = true,
    specieRelation = true,
  ): Promise<AnimalEntity[]> {
    const relations: string[] = [];
    if (picturesRelation) relations.push('pictures');
    if (breedRelation) relations.push('breed');
    if (breedRelation) relations.push('breed.picture');
    if (colorRelation) relations.push('color');
    if (specieRelation) relations.push('specie');

    return this.animalRepository.find({
      where: {
        companyId: companyId,
        status: status,
      },
      order: { creationDate: 'DESC' },
      relations: relations,
    });
  }

  async getAnimalById(animalId: string, companyId: string, picturesRelation = true): Promise<AnimalEntity | null> {
    const relations: string[] = [];
    if (picturesRelation) relations.push('pictures', 'breed', 'color', 'specie');
    return this.animalRepository.findOne({
      where: { id: animalId, companyId: companyId },
      relations: relations,
    });
  }

  async createAnimalFile(path: string, animalId: string, companyId: string) {
    const animal = await this.animalRepository.findOne({ where: { id: animalId, companyId: companyId }, relations: ['pictures'] });
    if (!animal) throw new HttpException('Animal not found', HttpStatus.NOT_FOUND);

    const newAnimalFile: createAnimalFileDto = {
      path: path,
      type: 'ANIMAL_PICTURE',
      index: animal.pictures.length,
      companyId: companyId,
    };
    //animal.pictures.push(newAnimalFile as FileEntity);
    return this.animalRepository.save(animal);
  }
}
