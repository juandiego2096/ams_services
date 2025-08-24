import { Controller, Post, Get, UseInterceptors, UploadedFile, Res, Param, Request, UseGuards } from '@nestjs/common';
import { FileService } from './file.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { createFileDto } from './file.type';
import { AuthGuard } from '../auth/auth.guard';
import path from 'path';
import { fileDestination } from './file.interceptor';

@Controller('files')
export class FileController {
  constructor(private readonly fileService: FileService, private readonly configService: ConfigService) {}

  @UseGuards(AuthGuard)
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: fileDestination,
        filename: (req, file, cb) => {
          cb(null, `${Date.now()}${path.extname(file.originalname)}`);
        },
      }),
    }),
  )
  async uploadFIle(@Request() req, @UploadedFile() file: Express.Multer.File) {
    const newFile: createFileDto = {
      companyId: req.body.companyId,
      filename: file.filename,
      type: 'UNKNOWN',
    };

    return await this.fileService.createFile(newFile);
  }

  @Get(':fileId')
  async getFile(@Res() res: Response, @Param('fileId') fileId: string) {
    const file = await this.fileService.getFile(fileId);
    if (file) res.sendFile(this.configService.get<string>('FILES_PATH', './') + this.configService.get('FILES_UPLOAD_FOLDER', '/uploads') + file.filename);
    return null;
  }
}
