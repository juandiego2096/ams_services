import { Body, Controller, Get, HttpException, HttpStatus, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { SpecieService } from './specie.service';
import { SpecieEntity } from '@entities/specie.entity';
import { ROLES } from '@constants/roles';
import { createSpecieDto } from './specie.type';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('species')
export class SpecieController {
  constructor(private readonly specieService: SpecieService) {}

  @Get('getSpecies')
  async getSpecies(): Promise<SpecieEntity[]> {
    return await this.specieService.getSpecies();
  }

  @Get('getSpecieById/:specieId')
  async getSpecieById(@Param('specieId') specieId: string): Promise<SpecieEntity | null> {
    return await this.specieService.getSpecieById(specieId);
  }

  @Get('getActiveSpecies')
  async getAvtiveSpecie(): Promise<SpecieEntity[]> {
    return await this.specieService.getSpecieByActive(true);
  }

  @Post('createSpecie')
  async createSpecie(@Request() req, @Body() newSpecie: createSpecieDto): Promise<SpecieEntity> {
    if (![ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(req.userRole)) {
      throw new HttpException('User not enabled to create a specie', HttpStatus.UNAUTHORIZED);
    }

    newSpecie.createdBy = req.userId;
    return await this.specieService.createSpecie(newSpecie);
  }

  @Patch('updateSpecie/:specieId')
  async updateSpecie(@Request() req, @Param('specieId') specieId: string, @Body() updateSpecie: createSpecieDto) {
    if (![ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(req.userRole)) {
      throw new HttpException('User not enabled to create a specie', HttpStatus.UNAUTHORIZED);
    }

    const specie = await this.specieService.getSpecieById(specieId);
    if (!specie) {
      throw new HttpException(`Specie with id  ${specieId} not found`, HttpStatus.NOT_FOUND);
    }

    specie.name = updateSpecie.name;
    specie.active = updateSpecie.active;
    await this.specieService.updateSpecie(specie);
  }
}
