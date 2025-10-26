import { Body, Controller, Get, HttpException, HttpStatus, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { BreedService } from './breed.service';
import { AuthGuard } from '../auth/auth.guard';
import { BreedEntity } from '@entities/breed.entity';
import { createBreedDto } from './breed.type';
import { ROLES } from '@constants/roles';
import { FileService } from '../file/file.service';

@UseGuards(AuthGuard)
@Controller('breeds')
export class BreedController {
  constructor(private readonly breedService: BreedService, private readonly fileService: FileService) {}

  @Get('getBreedsBySpecieId/:specieId')
  async getBreedsBySpecieId(@Param('specieId') specieId: string): Promise<BreedEntity[]> {
    return await this.breedService.getBreedsBySpecieId(specieId);
  }

  @Get('getBreeds')
  async getBreeds(): Promise<BreedEntity[]> {
    //throw new HttpException('prueba', HttpStatus.INTERNAL_SERVER_ERROR);
    return await this.breedService.getBreeds();
  }

  @Get('getBreedById/:breedId')
  async getBreedById(@Param('breedId') breedId: string): Promise<BreedEntity | null> {
    return await this.breedService.getBreedById(breedId);
  }

  @Post('createBreed')
  async createBreed(@Request() req, @Body() newBreed: createBreedDto): Promise<BreedEntity> {
    if (![ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(req.userRole)) {
      throw new HttpException('User not enabled to create a breed', HttpStatus.UNAUTHORIZED);
    }

    newBreed.createdBy = req.userId;
    return await this.breedService.createBreed(newBreed);
  }

  @Patch('updateBreed/:breedId')
  async updateBreed(@Request() req, @Param('breedId') breedId: string, @Body() updateBreed: createBreedDto) {
    if (![ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(req.userRole)) {
      throw new HttpException('User not enabled to create a breed', HttpStatus.UNAUTHORIZED);
    }

    const breed = await this.breedService.getBreedById(breedId, false);
    if (!breed) {
      throw new HttpException(`Specie with id  ${breedId} not found`, HttpStatus.NOT_FOUND);
    }

    breed.name = updateBreed.name;
    breed.active = updateBreed.active;
    breed.specieId = updateBreed.specieId;
    if (breed.pictureId !== updateBreed.pictureId) {
      if (breed.pictureId) this.fileService.linkFile(breed.pictureId, false);
      this.fileService.linkFile(updateBreed.pictureId, true);
      breed.pictureId = updateBreed.pictureId;
    }
    await this.breedService.updateBreed(breed);
  }
}
