import { Module } from '@nestjs/common';
import { SpecieService } from './specie.service';
import { SpecieController } from './specie.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpecieEntity } from '@entities/specie.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SpecieEntity])],
  controllers: [SpecieController],
  providers: [SpecieService],
})
export class SpecieModule {}
