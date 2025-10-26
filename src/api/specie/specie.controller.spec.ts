import { Test, TestingModule } from '@nestjs/testing';
import { SpecieController } from './specie.controller';
import { SpecieService } from './specie.service';
import { AuthGuard } from '../auth/auth.guard';
import { SpecieEntity } from '@entities/specie.entity';
import { HttpException } from '@nestjs/common';
import { ROLES } from '@constants/roles';

describe('SpecieController', () => {
  let controller: SpecieController;
  let specieService: jest.Mocked<SpecieService>;

  beforeEach(async () => {
    const moduleBuilder = Test.createTestingModule({
      controllers: [SpecieController],
      providers: [
        {
          provide: SpecieService,
          useValue: {
            getSpecies: jest.fn(),
            getSpecieById: jest.fn(),
            getSpecieByActive: jest.fn(),
            createSpecie: jest.fn(),
            updateSpecie: jest.fn(),
          },
        },
      ],
    });

    const module: TestingModule = await moduleBuilder
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn().mockResolvedValue(true) })
      .compile();

    controller = module.get<SpecieController>(SpecieController);
    specieService = module.get(SpecieService) as jest.Mocked<SpecieService>;
  });

  afterEach(() => jest.clearAllMocks());

  it('should return species list', async () => {
    specieService.getSpecies.mockResolvedValue([{ id: 'specie-1' } as SpecieEntity]);

    const result = await controller.getSpecies();

    expect(specieService.getSpecies).toHaveBeenCalled();
    expect(result).toHaveLength(1);
  });

  it('should create specie when role condition satisfied', async () => {
    const specie = { id: 'specie-1' } as SpecieEntity;
    specieService.createSpecie.mockResolvedValue(specie);

    const result = await controller.createSpecie(
      { userRole: ROLES.ADMIN, userId: 'user-1' } as any,
      { name: 'Canine', active: true, createdBy: undefined as any },
    );

    expect(specieService.createSpecie).toHaveBeenCalledWith(
      expect.objectContaining({
        createdBy: 'user-1',
      }),
    );
    expect(result).toBe(specie);
  });

  it('should reject specie creation for insufficient role', async () => {
    await expect(
      controller.createSpecie(
        { userRole: ROLES.SELLER, userId: 'user-1' } as any,
        { name: 'Canine', active: true, createdBy: undefined as any },
      ),
    ).rejects.toBeInstanceOf(HttpException);
  });

  it('should update specie when found', async () => {
    const specie = { id: 'specie-1', name: 'Old', active: true } as SpecieEntity;
    specieService.getSpecieById.mockResolvedValue(specie);

    await controller.updateSpecie(
      { userRole: ROLES.ADMIN, userId: 'user-1' } as any,
      'specie-1',
      { name: 'New', active: false, createdBy: 'user-1' },
    );

    expect(specieService.getSpecieById).toHaveBeenCalledWith('specie-1');
    expect(specieService.updateSpecie).toHaveBeenCalledWith(expect.objectContaining({ name: 'New', active: false }));
  });

  it('should throw when specie not found on update', async () => {
    specieService.getSpecieById.mockResolvedValue(null);

    await expect(
      controller.updateSpecie(
        { userRole: ROLES.ADMIN, userId: 'user-1' } as any,
        'missing',
        { name: 'New', active: false, createdBy: 'user-1' },
      ),
    ).rejects.toBeInstanceOf(HttpException);
  });
});
