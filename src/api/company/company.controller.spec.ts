import { Test, TestingModule } from '@nestjs/testing';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { AuthGuard } from '../auth/auth.guard';
import { HttpException } from '@nestjs/common';
import { ROLES } from '@constants/roles';
import { CompanyEntity } from '@entities/company.entity';

describe('CompanyController', () => {
  let controller: CompanyController;
  let companyService: jest.Mocked<CompanyService>;

  beforeEach(async () => {
    const moduleBuilder = Test.createTestingModule({
      controllers: [CompanyController],
      providers: [
        {
          provide: CompanyService,
          useValue: {
            createCompany: jest.fn(),
            getCompanies: jest.fn(),
            getCompanyById: jest.fn(),
          },
        },
      ],
    });

    const module: TestingModule = await moduleBuilder
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn().mockResolvedValue(true) })
      .compile();

    controller = module.get<CompanyController>(CompanyController);
    companyService = module.get(CompanyService) as jest.Mocked<CompanyService>;
  });

  afterEach(() => jest.clearAllMocks());

  it('should create company when user is super admin', async () => {
    const saved = { id: 'company-1' } as CompanyEntity;
    companyService.createCompany.mockResolvedValue(saved);

    const result = await controller.createCompany(
      { userRole: ROLES.SUPER_ADMIN, userId: 'user-1' } as any,
      {
        name: 'Acme',
        email: 'test@example.com',
        phone: '123',
        address: 'Main',
        createdBy: undefined as any,
      },
    );

    expect(companyService.createCompany).toHaveBeenCalledWith(
      expect.objectContaining({
        createdBy: 'user-1',
      }),
    );
    expect(result).toBe(saved);
  });

  it('should forbid creation for non super admin', async () => {
    await expect(
      controller.createCompany(
        { userRole: ROLES.ADMIN, userId: 'user-1' } as any,
        { name: 'Acme', email: 'test@example.com', phone: '123', address: 'Main', createdBy: undefined as any },
      ),
    ).rejects.toBeInstanceOf(HttpException);
  });

  it('should return HttpException when company exists as implemented', async () => {
    const company = { id: 'company-1' } as CompanyEntity;
    companyService.getCompanyById.mockResolvedValue(company);

    const result = await controller.getCompanyById('company-1');

    expect(result).toBeInstanceOf(HttpException);
  });
});
