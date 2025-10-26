import { Test, TestingModule } from '@nestjs/testing';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '../auth/auth.guard';

describe('FileController', () => {
  let controller: FileController;
  let fileService: jest.Mocked<FileService>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const moduleBuilder = Test.createTestingModule({
      controllers: [FileController],
      providers: [
        {
          provide: FileService,
          useValue: {
            createFile: jest.fn(),
            getFile: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    });

    const module: TestingModule = await moduleBuilder
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn().mockResolvedValue(true) })
      .compile();

    controller = module.get<FileController>(FileController);
    fileService = module.get(FileService) as jest.Mocked<FileService>;
    configService = module.get(ConfigService) as jest.Mocked<ConfigService>;
  });

  afterEach(() => jest.clearAllMocks());

  it('should create file from upload response', async () => {
    const request = { body: { companyId: 'company-1' } } as any;
    const file = { filename: 'file.png' } as Express.Multer.File;
    const savedFile = { id: 'file-1' } as any;
    fileService.createFile.mockResolvedValue(savedFile);

    const result = await controller.uploadFIle(request, file);

    expect(fileService.createFile).toHaveBeenCalledWith(
      expect.objectContaining({
        filename: 'file.png',
        companyId: 'company-1',
      }),
    );
    expect(result).toBe(savedFile);
  });

  it('should send file from configured path when found', async () => {
    fileService.getFile.mockResolvedValue({ filename: 'file.png' } as any);
    configService.get.mockImplementation((key: string, defaultValue?: any) => {
      if (key === 'FILES_PATH') return '/var/';
      if (key === 'FILES_UPLOAD_FOLDER') return '/uploads/';
      return defaultValue;
    });
    const res = { sendFile: jest.fn() } as any;

    await controller.getFile(res, 'file-1');

    expect(fileService.getFile).toHaveBeenCalledWith('file-1');
    expect(res.sendFile).toHaveBeenCalledWith('/var//uploads/file.png');
  });

  it('should return null when file is not found', async () => {
    fileService.getFile.mockResolvedValue(null);
    const res = { sendFile: jest.fn() } as any;

    const result = await controller.getFile(res, 'file-1');

    expect(res.sendFile).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });
});
