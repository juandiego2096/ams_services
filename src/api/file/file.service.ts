import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FileEntity } from '@entities/file.entity';
import { Repository } from 'typeorm';
import { createFileDto } from './file.type';

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
  ) {}

  async getFile(fileId: string): Promise<FileEntity | null> {
    return await this.fileRepository.findOne({
      where: {
        id: fileId,
      },
    });
  }

  async createFile(file: createFileDto): Promise<FileEntity> {
    return this.fileRepository.save({
      filename: file.filename,
      type: file.type,
      creationDate: new Date(),
      companyId: file.companyId,
      linked: false,
    });
  }

  async linkFile(fileId: string, link: boolean): Promise<FileEntity | null> {
    const file = await this.fileRepository.findOneBy({ id: fileId });
    if (!file) return null;
    file.linked = link;

    return this.fileRepository.save(file);
  }
}
