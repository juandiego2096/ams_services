import { Test, TestingModule } from '@nestjs/testing';
import { BreedController } from './breed.controller';
import { BreedService } from './breed.service';
import { FileService } from '../file/file.service';
import { AuthGuard } from '../auth/auth.guard';
import { HttpException } from '@nestjs/common';
import { ROLES } from '@constants/roles';
import { createBreedDto } from './breed.type';

describe('BreedController', () => {
  let controller: BreedController;
  let breedService: jest.Mocked<BreedService>;
  let fileService: jest.Mocked<FileService>;

  beforeEach(async () => {
    const moduleBuilder = Test.createTestingModule({
      controllers: [BreedController],
      providers: [
        {
          provide: BreedService,
          useValue: {
            getBreedsBySpecieId: jest.fn(),
            getBreeds: jest.fn(),
            getBreedById: jest.fn(),
            createBreed: jest.fn(),
            updateBreed: jest.fn(),
          },
        },
        {
          provide: FileService,
          useValue: {
            linkFile: jest.fn(),
          },
        },
      ],
    });

    const module: TestingModule = await moduleBuilder
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn().mockResolvedValue(true) })
      .compile();

    controller = module.get<BreedController>(BreedController);
    breedService = module.get(BreedService) as jest.Mocked<BreedService>;
    fileService = module.get(FileService) as jest.Mocked<FileService>;
  });

  afterEach(() => jest.clearAllMocks());

  const validReq = { userRole: ROLES.ADMIN, userId: 'user-1' } as any;

  it('should create breed when user passes guard check', async () => {
    const dto: createBreedDto = {
      name: 'Husky',
      specieId: 'specie-1',
      active: true,
      pictureId: 'picture-1',
      createdBy: undefined as any,
    };
    const saved = { id: 'breed-1' } as any;
    breedService.createBreed.mockResolvedValue(saved);

    const result = await controller.createBreed({ ...validReq }, { ...dto });

    expect(breedService.createBreed).toHaveBeenCalledWith(
      expect.objectContaining({
        createdBy: 'user-1',
      }),
    );
    expect(result).toBe(saved);
  });

  it('should reject breed creation for unauthorized role', async () => {
    await expect(
      controller.createBreed({ userRole: ROLES.SELLER, userId: 'user-1' } as any, {
        name: 'Husky',
        specieId: 'specie-1',
        active: true,
        pictureId: 'picture-1',
        createdBy: undefined as any,
      }),
    ).rejects.toBeInstanceOf(HttpException);
    expect(breedService.createBreed).not.toHaveBeenCalled();
  });

  it('should update breed and relink picture when changed', async () => {
    const breed = {
      id: 'breed-1',
      name: 'Old name',
      specieId: 'specie-1',
      active: true,
      pictureId: 'old-picture',
    } as any;
    breedService.getBreedById.mockResolvedValue(breed);
    breedService.updateBreed.mockResolvedValue(breed);

    await controller.updateBreed(
      { ...validReq },
      'breed-1',
      {
        name: 'New name',
        specieId: 'specie-1',
        active: true,
        pictureId: 'new-picture',
        createdBy: 'user-1',
      },
    );

    expect(breedService.getBreedById).toHaveBeenCalledWith('breed-1', false);
    expect(fileService.linkFile).toHaveBeenCalledWith('old-picture', false);
    expect(fileService.linkFile).toHaveBeenCalledWith('new-picture', true);
    expect(breedService.updateBreed).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'New name',
        pictureId: 'new-picture',
      }),
    );
  });

  it('should throw when breed does not exist on update', async () => {
    breedService.getBreedById.mockResolvedValue(null);

    await expect(
      controller.updateBreed({ ...validReq }, 'unknown', {
        name: 'Name',
        specieId: 'specie-1',
        active: true,
        pictureId: 'pic',
        createdBy: 'user-1',
      }),
    ).rejects.toBeInstanceOf(HttpException);
  });
});
