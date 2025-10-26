import { Test, TestingModule } from '@nestjs/testing';
import { AnimalController } from './animal.controller';
import { AnimalService } from './animal.service';
import { FileService } from '../file/file.service';
import { TransactionService } from '../transaction/transaction.service';
import { BreedService } from '../breed/breed.service';
import { NotificationsService } from '../notification/notification.service';
import { STATUS, GENDERS } from '@constants/animals';
import { NOTIFICATION_TYPES } from '@constants/notifications';
import { AnimalEntity } from '@entities/animal.entity';
import { FileEntity } from '@entities/file.entity';
import { HttpException } from '@nestjs/common';
import { createAnimalDto } from './animal.type';
import { AuthGuard } from '../auth/auth.guard';

describe('AnimalController', () => {
  let controller: AnimalController;
  let animalService: jest.Mocked<AnimalService>;
  let fileService: jest.Mocked<FileService>;
  let notificationService: jest.Mocked<NotificationsService>;

  beforeEach(async () => {
    const moduleBuilder = Test.createTestingModule({
      controllers: [AnimalController],
      providers: [
        {
          provide: AnimalService,
          useValue: {
            createAnimal: jest.fn(),
            getAnimalById: jest.fn(),
            updateAnimal: jest.fn(),
            getAnimalsByStatus: jest.fn(),
          },
        },
        {
          provide: FileService,
          useValue: {
            getFile: jest.fn(),
          },
        },
        {
          provide: TransactionService,
          useValue: {
            getTransactionsByAnimalId: jest.fn(),
          },
        },
        {
          provide: BreedService,
          useValue: {
            getAnimalsByStatusGroupByBreed: jest.fn(),
          },
        },
        {
          provide: NotificationsService,
          useValue: {
            createNotification: jest.fn(),
            createUserNotification: jest.fn(),
          },
        },
      ],
    });

    const module: TestingModule = await moduleBuilder
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<AnimalController>(AnimalController);
    animalService = module.get(AnimalService) as jest.Mocked<AnimalService>;
    fileService = module.get(FileService) as jest.Mocked<FileService>;
    notificationService = module.get(NotificationsService) as jest.Mocked<NotificationsService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createAnimalAvailable', () => {
    it('should mark animal as available, hydrate pictures and create notification', async () => {
      const companyId = 'company-1';
      const pictureId = 'picture-uuid';
      const dto: createAnimalDto = {
        specieId: 'specie-1',
        breedId: 'breed-1',
        colorId: 'color-1',
        birthDate: '2020-01-01',
        companyId: 'different-company',
        gender: GENDERS.MALE,
        price: 1500,
        status: STATUS.SOLD,
        pictures: [pictureId],
      };

      const persistedAnimal = { id: 'animal-1' } as AnimalEntity;
      const pictureEntity = { id: pictureId } as FileEntity;

      fileService.getFile.mockResolvedValue(pictureEntity);
      animalService.createAnimal.mockResolvedValue(persistedAnimal);

      const result = await controller.createAnimalAvailable(companyId, { ...dto });

      expect(fileService.getFile).toHaveBeenCalledWith(pictureId);
      expect(animalService.createAnimal).toHaveBeenCalledWith(
        expect.objectContaining({
          companyId,
          status: STATUS.AVAILABLE,
        }),
        [pictureEntity],
      );
      expect(notificationService.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          companyId,
          type: NOTIFICATION_TYPES.AVAILABLE,
          url: `/available/${persistedAnimal.id}`,
        }),
      );
      expect(result).toBe(persistedAnimal);
    });
  });

  describe('updateAnimal', () => {
    it('should update animal fields and append resolved pictures', async () => {
      const companyId = 'company-1';
      const animalId = 'animal-1';
      const storedAnimal = {
        id: animalId,
        status: STATUS.AVAILABLE,
        specieId: 'specie-0',
        breedId: 'breed-0',
        colorId: 'color-0',
        birthDate: new Date('2019-01-01'),
        creationDate: new Date('2019-01-01'),
        companyId,
        gender: GENDERS.FEMALE,
        price: 1000,
        pictures: [],
      } as unknown as AnimalEntity;

      const updateDto: createAnimalDto = {
        specieId: 'specie-1',
        breedId: 'breed-1',
        colorId: 'color-1',
        birthDate: '2020-05-05',
        companyId,
        gender: GENDERS.MALE,
        price: 2000,
        status: STATUS.AVAILABLE,
        pictures: ['new-picture'],
      };

      const newPicture = { id: 'new-picture' } as FileEntity;

      animalService.getAnimalById.mockResolvedValue(storedAnimal);
      fileService.getFile.mockResolvedValue(newPicture);
      animalService.updateAnimal.mockResolvedValue(storedAnimal);

      const result = await controller.updateAnimal(companyId, animalId, { ...updateDto });

      expect(animalService.getAnimalById).toHaveBeenCalledWith(animalId, companyId);
      expect(storedAnimal.specieId).toBe(updateDto.specieId);
      expect(storedAnimal.birthDate).toBeInstanceOf(Date);
      expect((storedAnimal.birthDate as Date).toISOString()).toBe(new Date(updateDto.birthDate).toISOString());
      expect(storedAnimal.pictures).toContain(newPicture);
      expect(animalService.updateAnimal).toHaveBeenCalledWith(storedAnimal);
      expect(result).toBe(storedAnimal);
    });

    it('should throw when animal is not found', async () => {
      animalService.getAnimalById.mockResolvedValue(null);

      await expect(
        controller.updateAnimal('company-1', 'animal-1', {
          specieId: 'specie',
          breedId: 'breed',
          colorId: 'color',
          birthDate: '2020-01-01',
          companyId: 'company-1',
          gender: GENDERS.MALE,
          price: 100,
          status: STATUS.AVAILABLE,
          pictures: [],
        }),
      ).rejects.toBeInstanceOf(HttpException);
      expect(fileService.getFile).not.toHaveBeenCalled();
      expect(animalService.updateAnimal).not.toHaveBeenCalled();
    });
  });
});
