import { Test, TestingModule } from '@nestjs/testing';
import { FileService } from './file.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FileEntity } from '@entities/file.entity';
import { Repository } from 'typeorm';

describe('FileService', () => {
  let service: FileService;
  let repository: jest.Mocked<Repository<FileEntity>>;
  const token = getRepositoryToken(FileEntity);

  beforeEach(async () => {
    const repoMock: Partial<jest.Mocked<Repository<FileEntity>>> = {
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileService,
        { provide: token, useValue: repoMock },
      ],
    }).compile();

    service = module.get<FileService>(FileService);
    repository = module.get(token);
  });

  afterEach(() => jest.clearAllMocks());

  it('should retrieve file by id', async () => {
    repository.findOne.mockResolvedValue({ id: 'file-1' } as FileEntity);

    await service.getFile('file-1');

    expect(repository.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'file-1' },
      }),
    );
  });

  it('should create file with defaults', async () => {
    const dto = { filename: 'test.png', type: 'IMG', companyId: 'company-1' };
    repository.save.mockResolvedValue({ id: 'file-1' } as FileEntity);

    await service.createFile(dto);

    expect(repository.save).toHaveBeenCalledWith(expect.objectContaining(dto));
  });

  it('should relink file when found', async () => {
    const file = { id: 'file-1', linked: false } as FileEntity;
    repository.findOneBy.mockResolvedValue(file);
    repository.save.mockResolvedValue(file);

    const response = await service.linkFile('file-1', true);

    expect(repository.findOneBy).toHaveBeenCalledWith({ id: 'file-1' });
    expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({ linked: true }));
    expect(response).toBe(file);
  });

  it('should return null when file not found to relink', async () => {
    repository.findOneBy.mockResolvedValue(null);

    const response = await service.linkFile('missing', true);

    expect(response).toBeNull();
    expect(repository.save).not.toHaveBeenCalled();
  });
});
