import { Injectable } from '@nestjs/common';
import { ColorEntity } from '@entities/color.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { createColorDto } from './color.type';

@Injectable()
export class ColorService {
  constructor(
    @InjectRepository(ColorEntity)
    private readonly colorRepository: Repository<ColorEntity>,
  ) {}

  async getColors(): Promise<ColorEntity[]> {
    return this.colorRepository.find();
  }

  async getActiveColors(active: boolean): Promise<ColorEntity[]> {
    return this.colorRepository.find({ where: { active: active }});
  }

  async getColorById(colorId: string): Promise<ColorEntity | null> {
    return this.colorRepository.findOne({ where: { id: colorId }, relations: ['colorCreationUser'] });
  }

  async createColor(color: createColorDto): Promise<ColorEntity> {
    return this.colorRepository.save({
      name: color.name,
      active: color.active,
      createdBy: color.createdBy,
    });
  }

  async updateColor(color: ColorEntity, colorId: string) {
    return this.colorRepository.update({ id: colorId }, color);
  }
}
