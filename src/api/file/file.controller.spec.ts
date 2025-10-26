import { Test, TestingModule } from '@nestjs/testing';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { AppConfigService } from '../../config/configuration.service';
import { AuthGuard } from '../auth/auth.guard';

describe('FileController', () => {
  let controller: FileController;
  let fileService: jest.Mocked<FileService>;
  let configService: jest.Mocked<AppConfigService>;

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
          provide: AppConfigService,
          useValue: {
            filesPath: '/var/',
            filesUploadFolder: '/uploads/',
            jwtSecret: 'secret',
            jwtExpiration: '1h',
            hashSalt: 10,
            serverPort: 3000,
            serverHost: '0.0.0.0',
            socketPort: 81,
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
    configService = module.get(AppConfigService) as jest.Mocked<AppConfigService>;
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
