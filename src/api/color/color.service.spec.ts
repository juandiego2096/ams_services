import { Test, TestingModule } from '@nestjs/testing';
import { ColorService } from './color.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ColorEntity } from '@entities/color.entity';
import { Repository } from 'typeorm';
import { createColorDto } from './color.type';

describe('ColorService', () => {
  let service: ColorService;
  let repository: jest.Mocked<Repository<ColorEntity>>;
  const token = getRepositoryToken(ColorEntity);

  beforeEach(async () => {
    const repoMock: Partial<jest.Mocked<Repository<ColorEntity>>> = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ColorService,
        { provide: token, useValue: repoMock },
      ],
    }).compile();

    service = module.get<ColorService>(ColorService);
    repository = module.get(token);
  });

  afterEach(() => jest.clearAllMocks());

  it('should return all colors', async () => {
    repository.find.mockResolvedValue([]);

    await service.getColors();

    expect(repository.find).toHaveBeenCalledTimes(1);
  });

  it('should filter active colors', async () => {
    repository.find.mockResolvedValue([]);

    await service.getActiveColors(true);

    expect(repository.find).toHaveBeenCalledWith({ where: { active: true } });
  });

  it('should create color via repository save', async () => {
    const dto: createColorDto = { name: 'Brown', active: true, createdBy: 'user-1' };
    repository.save.mockResolvedValue({ id: 'color-1' } as ColorEntity);

    await service.createColor(dto);

    expect(repository.save).toHaveBeenCalledWith(expect.objectContaining(dto));
  });

  it('should update color using repository update', async () => {
    const color = { name: 'Brown', active: false } as ColorEntity;

    await service.updateColor(color, 'color-1');

    expect(repository.update).toHaveBeenCalledWith({ id: 'color-1' }, color);
  });

  it('should get color by id including creation user relation', async () => {
    repository.findOne.mockResolvedValue(null);

    await service.getColorById('color-1');

    expect(repository.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'color-1' },
        relations: ['colorCreationUser'],
      }),
    );
  });
});
