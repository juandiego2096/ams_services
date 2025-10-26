import { Test, TestingModule } from '@nestjs/testing';
import { ColorController } from './color.controller';
import { ColorService } from './color.service';
import { AuthGuard } from '../auth/auth.guard';
import { ColorEntity } from '@entities/color.entity';
import { HttpException } from '@nestjs/common';
import { ROLES } from '@constants/roles';

describe('ColorController', () => {
  let controller: ColorController;
  let colorService: jest.Mocked<ColorService>;

  beforeEach(async () => {
    const moduleBuilder = Test.createTestingModule({
      controllers: [ColorController],
      providers: [
        {
          provide: ColorService,
          useValue: {
            getColors: jest.fn(),
            getActiveColors: jest.fn(),
            getColorById: jest.fn(),
            createColor: jest.fn(),
            updateColor: jest.fn(),
          },
        },
      ],
    });

    const module: TestingModule = await moduleBuilder
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn().mockResolvedValue(true) })
      .compile();

    controller = module.get<ColorController>(ColorController);
    colorService = module.get(ColorService) as jest.Mocked<ColorService>;
  });

  afterEach(() => jest.clearAllMocks());

  it('should return colors from service', async () => {
    colorService.getColors.mockResolvedValue([{ id: 'color-1' } as ColorEntity]);

    const result = await controller.getColors();

    expect(result).toHaveLength(1);
    expect(colorService.getColors).toHaveBeenCalled();
  });

  it('should create color when role matches controller guard', async () => {
    const color = { id: 'color-1' } as ColorEntity;
    colorService.createColor.mockResolvedValue(color);

    const result = await controller.createColor({ userRole: ROLES.ADMIN, userId: 'user-1' } as any, {
      name: 'Brown',
      active: true,
      createdBy: undefined as any,
    });

    expect(colorService.createColor).toHaveBeenCalledWith(
      expect.objectContaining({
        createdBy: 'user-1',
      }),
    );
    expect(result).toBe(color);
  });

  it('should forbid creation for wrong role', async () => {
    await expect(
      controller.createColor({ userRole: ROLES.SELLER, userId: 'user-1' } as any, {
        name: 'Brown',
        active: true,
        createdBy: undefined as any,
      }),
    ).rejects.toBeInstanceOf(HttpException);
    expect(colorService.createColor).not.toHaveBeenCalled();
  });

  it('should update existing color', async () => {
    const color = { id: 'color-1', name: 'Old', active: true } as any;
    colorService.getColorById.mockResolvedValue(color);

    await controller.updateColor(
      { userRole: ROLES.ADMIN, userId: 'user-1' } as any,
      'color-1',
      { name: 'New', active: false, createdBy: 'user-1' },
    );

    expect(colorService.getColorById).toHaveBeenCalledWith('color-1');
    expect(colorService.updateColor).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'New', active: false }),
      'color-1',
    );
  });

  it('should throw when color not found during update', async () => {
    colorService.getColorById.mockResolvedValue(null);

    await expect(
      controller.updateColor(
        { userRole: ROLES.ADMIN, userId: 'user-1' } as any,
        'color-1',
        { name: 'New', active: false, createdBy: 'user-1' },
      ),
    ).rejects.toBeInstanceOf(HttpException);
  });
});
