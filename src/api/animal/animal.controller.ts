import { Controller, Post, Get, Body, UseGuards, Param, Patch, HttpException, HttpStatus } from '@nestjs/common';
import { AnimalService } from './animal.service';
import { createAnimalDto } from './animal.type';
import { STATUS, TRANSACTION_STATUS, TRANSACTION_TYPES } from '@constants/animals';
import { AuthGuard } from '../auth/auth.guard';
import { FileService } from '../file/file.service';
import { FileEntity } from '@entities/file.entity';
import { TransactionService } from '../transaction/transaction.service';
import { AnimalEntity } from '@entities/animal.entity';
import { BreedEntity } from '@entities/breed.entity';
import { BreedService } from '../breed/breed.service';
import { NotificationsService } from '../notification/notification.service';
import { NOTIFICATION_TYPES } from '@constants/notifications';
import { createNotificationDto } from '../notification/notification.type';

@UseGuards(AuthGuard)
@Controller('animals/:companyId')
export class AnimalController {
  constructor(
    private readonly animalService: AnimalService,
    private readonly fileService: FileService,
    private readonly transactionService: TransactionService,
    private readonly breedService: BreedService,
    private readonly notificationService: NotificationsService,
  ) {}

  @Post('createAvailable')
  async createAnimalAvailable(@Param('companyId') companyId: string, @Body() newAnimal: createAnimalDto): Promise<AnimalEntity> {
    newAnimal.status = STATUS.AVAILABLE;
    newAnimal.companyId = companyId;
    const animalPictures: FileEntity[] = [];
    for (const element of newAnimal.pictures) {
      const file = await this.fileService.getFile(element);
      if (file) animalPictures.push(file);
    }
    const newAvailable = await this.animalService.createAnimal(newAnimal, animalPictures);
    if (newAvailable) {
      const newNotification: createNotificationDto = {
        companyId: companyId,
        type: NOTIFICATION_TYPES.AVAILABLE,
        url: `/available/${newAvailable.id}`,
        date: new Date(),
      };

      this.notificationService.createNotification(newNotification);
    }
    return newAvailable;
  }

  @Patch('updateAnimal/:animalId')
  async updateAnimal(@Param('companyId') companyId: string, @Param('animalId') animalId: string, @Body() updateAnimal: createAnimalDto): Promise<AnimalEntity> {
    const animal = await this.animalService.getAnimalById(animalId, companyId);
    if (!animal) {
      throw new HttpException(`Animal with id  ${animalId} not found`, HttpStatus.NOT_FOUND);
    }

    animal.specieId = updateAnimal.specieId;
    animal.breedId = updateAnimal.breedId;
    animal.colorId = updateAnimal.colorId;
    animal.gender = updateAnimal.gender;
    animal.birthDate = new Date(updateAnimal.birthDate);
    animal.price = updateAnimal.price;
    for (const element of updateAnimal.pictures) {
      const file = await this.fileService.getFile(element);
      if (file) animal.pictures.push(file);
    }
    return await this.animalService.updateAnimal(animal);
  }

  @Post('uploadFile/:animalId')
  async uploadFIle(@Param('companyId') companyId: string, @Param('animalId') animalId: string, @Body() file: { path: string }) {
    return await this.animalService.createAnimalFile(file.path, animalId, companyId);
  }

  @Get('getAnimalById/:animalId')
  async getAnimalAvailableById(@Param('companyId') companyId: string, @Param('animalId') animalId: string): Promise<AnimalEntity | null> {
    const animal = await this.animalService.getAnimalById(animalId, companyId);
    if (animal) {
      animal['transactionPending'] = false;
      const transactionsPending = await this.transactionService.getTransactionsByAnimalId(
        [TRANSACTION_TYPES.RESERVATION, TRANSACTION_TYPES.SELL],
        [TRANSACTION_STATUS.PENDING],
        animal.id,
      );
      if (transactionsPending.length > 0) animal['transactionPending'] = true;
    }

    return animal;
  }

  @Get('getAvailables')
  async getAnimalAvailables(@Param('companyId') companyId: string): Promise<AnimalEntity[]> {
    return await this.animalService.getAnimalsByStatus(companyId, STATUS.AVAILABLE);
  }

  @Get('getAvailablesGroupByBreed')
  async getAnimalAvailablesGroupByBreed(@Param('companyId') companyId: string): Promise<BreedEntity[]> {
    return await this.breedService.getAnimalsByStatusGroupByBreed(companyId, STATUS.AVAILABLE);
  }
}
