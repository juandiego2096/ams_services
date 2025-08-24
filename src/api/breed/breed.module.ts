import { Module } from '@nestjs/common';
import { BreedService } from './breed.service';
import { BreedController } from './breed.controller';
import { BreedEntity } from '@entities/breed.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileService } from '../file/file.service';
import { FileEntity } from '@entities/file.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BreedEntity, FileEntity])],
  controllers: [BreedController],
  providers: [BreedService, FileService],
})
export class BreedModule {}
