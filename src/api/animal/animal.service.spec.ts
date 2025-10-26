import { Test, TestingModule } from '@nestjs/testing';
import { AnimalService } from './animal.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AnimalEntity } from '@entities/animal.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { createAnimalDto } from './animal.type';
import { FileEntity } from '@entities/file.entity';
import { STATUS, GENDERS } from '@constants/animals';

describe('AnimalService', () => {
  let service: AnimalService;
  let repository: jest.Mocked<Repository<AnimalEntity>>;

  beforeEach(async () => {
    const repositoryMock: Partial<jest.Mocked<Repository<AnimalEntity>>> = {
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnimalService,
        { provide: getRepositoryToken(AnimalEntity), useValue: repositoryMock },
        { provide: ConfigService, useValue: {} },
      ],
    }).compile();

    service = module.get<AnimalService>(AnimalService);
    repository = module.get(getRepositoryToken(AnimalEntity));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should persist a new animal converting birthDate and attaching pictures', async () => {
    const dto: createAnimalDto = {
      specieId: 'specie-1',
      breedId: 'breed-1',
      colorId: 'color-1',
      birthDate: '2020-02-02',
      companyId: 'company-1',
      gender: GENDERS.MALE,
      price: 900,
      status: STATUS.AVAILABLE,
      pictures: [],
    };

    const pictures = [{ id: 'file-1' } as FileEntity];
    const persisted = { id: 'animal-1' } as AnimalEntity;
    repository.save.mockResolvedValue(persisted);

    const result = await service.createAnimal(dto, pictures);

    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        specieId: dto.specieId,
        breedId: dto.breedId,
        colorId: dto.colorId,
        birthDate: new Date(dto.birthDate),
        pictures,
      }),
    );
    expect(result).toBe(persisted);
  });

  it('should request relations when retrieving animals by status', async () => {
    repository.find.mockResolvedValue([]);

    await service.getAnimalsByStatus('company-1', STATUS.AVAILABLE);

    expect(repository.find).toHaveBeenCalled();
    const [[callArgs]] = repository.find.mock.calls;
    expect(callArgs).toBeDefined();
    expect(callArgs?.relations ?? []).toEqual(expect.arrayContaining(['pictures', 'breed', 'breed.picture', 'color', 'specie']));
  });

  it('should include relations when fetching by id with pictures', async () => {
    repository.findOne.mockResolvedValue(null);

    await service.getAnimalById('animal-1', 'company-1');

    expect(repository.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        relations: expect.arrayContaining(['pictures', 'breed', 'color', 'specie']),
      }),
    );
  });
});
