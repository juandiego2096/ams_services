import { Body, Controller, Get, HttpException, HttpStatus, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { ColorService } from './color.service';
import { ColorEntity } from '@entities/color.entity';
import { ROLES } from '@constants/roles';
import { createColorDto } from './color.type';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('colors')
export class ColorController {
  constructor(private readonly colorService: ColorService) {}

  @Get('getColors')
  async getColors(): Promise<ColorEntity[]> {
    return await this.colorService.getColors();
  }

  @Get('getActiveColors')
  async getActiveColors(): Promise<ColorEntity[]> {
    return await this.colorService.getActiveColors(true);
  }

  @Get('getColorById/:colorId')
  async getColorById(@Param('colorId') colorId: string): Promise<ColorEntity | null> {
    return await this.colorService.getColorById(colorId);
  }

  @Post('createColor')
  async createColor(@Request() req, @Body() newColor: createColorDto): Promise<ColorEntity> {
    if (![ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(req.userRole)) {
      throw new HttpException('User not enabled to create a color', HttpStatus.UNAUTHORIZED);
    }

    newColor.createdBy = req.userId;
    return await this.colorService.createColor(newColor);
  }

  @Patch('updateColor/:colorId')
  async updateColor(@Request() req, @Param('colorId') colorId: string, @Body() updateColor: createColorDto) {
    if (![ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(req.userRole)) {
      throw new HttpException('User not enabled to update a color', HttpStatus.UNAUTHORIZED);
    }

    const color = await this.colorService.getColorById(colorId);
    if (!color) {
      throw new HttpException(`Color with id  ${colorId} not found`, HttpStatus.NOT_FOUND);
    }

    color.name = updateColor.name;
    color.active = updateColor.active;
    await this.colorService.updateColor(color, colorId);
  }
}
