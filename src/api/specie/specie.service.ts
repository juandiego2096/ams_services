import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SpecieEntity } from '@entities/specie.entity';
import { Repository } from 'typeorm';
import { createSpecieDto } from './specie.type';

@Injectable()
export class SpecieService {
  constructor(
    @InjectRepository(SpecieEntity)
    private readonly specieRepository: Repository<SpecieEntity>,
  ) {}

  async getSpecies(): Promise<SpecieEntity[]> {
    return this.specieRepository.find();
  }

  async getSpecieById(specieId: string): Promise<SpecieEntity | null> {
    return this.specieRepository.findOne({ where: { id: specieId }, relations: ['breeds', 'specieCreationUser'] });
  }

  async getSpecieByActive(active: boolean): Promise<SpecieEntity[]> {
    return this.specieRepository.find({ where: { active: active }, relations: ['breeds', 'specieCreationUser'] });
  }

  async createSpecie(specie: createSpecieDto): Promise<SpecieEntity> {
    return this.specieRepository.save({
      name: specie.name,
      active: specie.active,
      createdBy: specie.createdBy,
    });
  }

  async updateSpecie(specie: SpecieEntity) {
    return this.specieRepository.save(specie);
  }
}
