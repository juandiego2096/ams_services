import { Test, TestingModule } from '@nestjs/testing';
import { CompanyService } from './company.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CompanyEntity } from '@entities/company.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { createCompanyDto } from './company.type';

describe('CompanyService', () => {
  let service: CompanyService;
  let repository: jest.Mocked<Repository<CompanyEntity>>;
  const token = getRepositoryToken(CompanyEntity);

  beforeEach(async () => {
    const repoMock: Partial<jest.Mocked<Repository<CompanyEntity>>> = {
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyService,
        { provide: token, useValue: repoMock },
        { provide: ConfigService, useValue: {} },
      ],
    }).compile();

    service = module.get<CompanyService>(CompanyService);
    repository = module.get(token);
  });

  afterEach(() => jest.clearAllMocks());

  it('should persist company through repository', async () => {
    const dto: createCompanyDto = {
      name: 'Acme',
      email: 'test@example.com',
      address: 'Main',
      phone: '123',
      createdBy: 'user-1',
    };
    repository.save.mockResolvedValue({ id: 'company-1' } as CompanyEntity);

    await service.createCompany(dto);

    expect(repository.save).toHaveBeenCalledWith(expect.objectContaining(dto));
  });

  it('should return companies from repository', async () => {
    repository.find.mockResolvedValue([]);

    await service.getCompanies();

    expect(repository.find).toHaveBeenCalled();
  });

  it('should find company by id', async () => {
    repository.findOne.mockResolvedValue(null);

    await service.getCompanyById('company-1');

    expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 'company-1' } });
  });
});
