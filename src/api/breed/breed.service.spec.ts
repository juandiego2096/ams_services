import { Test, TestingModule } from '@nestjs/testing';
import { BreedService } from './breed.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BreedEntity } from '@entities/breed.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { createBreedDto } from './breed.type';

describe('BreedService', () => {
  let service: BreedService;
  let repository: jest.Mocked<Repository<BreedEntity>>;
  const token = getRepositoryToken(BreedEntity);

  beforeEach(async () => {
    const repoMock: Partial<jest.Mocked<Repository<BreedEntity>>> = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BreedService,
        { provide: token, useValue: repoMock },
        { provide: ConfigService, useValue: {} },
      ],
    }).compile();

    service = module.get<BreedService>(BreedService);
    repository = module.get(token);
  });

  afterEach(() => jest.clearAllMocks());

  it('should fetch breeds by specie id with relations', async () => {
    repository.find.mockResolvedValue([]);

    await service.getBreedsBySpecieId('specie-1');

    expect(repository.find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { specieId: 'specie-1' },
        relations: ['specie'],
      }),
    );
  });

  it('should create breed via repository save', async () => {
    const dto: createBreedDto = {
      name: 'Husky',
      specieId: 'specie-1',
      active: true,
      pictureId: 'file-1',
      createdBy: 'user-1',
    };

    repository.save.mockResolvedValue({ id: 'breed-1' } as BreedEntity);

    await service.createBreed(dto);

    expect(repository.save).toHaveBeenCalledWith(expect.objectContaining(dto));
  });

  it('should build query for animals grouped by breed', async () => {
    const qb: any = {
      leftJoinAndSelect: jest.fn(),
      where: jest.fn(),
      getMany: jest.fn().mockResolvedValue([]),
    };
    qb.leftJoinAndSelect.mockReturnValue(qb);
    qb.where.mockReturnValue(qb);
    repository.createQueryBuilder.mockReturnValue(qb);

    await service.getAnimalsByStatusGroupByBreed('company-1', 1);

    expect(repository.createQueryBuilder).toHaveBeenCalledWith('breeds');
    expect(qb.leftJoinAndSelect).toHaveBeenCalled();
    expect(qb.getMany).toHaveBeenCalled();
  });
});
