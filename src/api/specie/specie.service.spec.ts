import { Test, TestingModule } from '@nestjs/testing';
import { SpecieService } from './specie.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SpecieEntity } from '@entities/specie.entity';
import { Repository } from 'typeorm';
import { createSpecieDto } from './specie.type';

describe('SpecieService', () => {
  let service: SpecieService;
  let repository: jest.Mocked<Repository<SpecieEntity>>;
  const token = getRepositoryToken(SpecieEntity);

  beforeEach(async () => {
    const repoMock: Partial<jest.Mocked<Repository<SpecieEntity>>> = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpecieService,
        { provide: token, useValue: repoMock },
      ],
    }).compile();

    service = module.get<SpecieService>(SpecieService);
    repository = module.get(token);
  });

  afterEach(() => jest.clearAllMocks());

  it('should get species list', async () => {
    repository.find.mockResolvedValue([]);

    await service.getSpecies();

    expect(repository.find).toHaveBeenCalledWith();
  });

  it('should find specie by id with relations', async () => {
    repository.findOne.mockResolvedValue(null);

    await service.getSpecieById('specie-1');

    expect(repository.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'specie-1' },
        relations: ['breeds', 'specieCreationUser'],
      }),
    );
  });

  it('should filter species by active flag', async () => {
    repository.find.mockResolvedValue([]);

    await service.getSpecieByActive(true);

    expect(repository.find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { active: true },
        relations: ['breeds', 'specieCreationUser'],
      }),
    );
  });

  it('should create specie', async () => {
    const dto: createSpecieDto = { name: 'Canine', active: true, createdBy: 'user-1' };

    await service.createSpecie(dto);

    expect(repository.save).toHaveBeenCalledWith(expect.objectContaining(dto));
  });
});
