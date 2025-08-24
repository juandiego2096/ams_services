import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CompanyEntity } from '@entities/company.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { createCompanyDto } from './company.type';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(CompanyEntity)
    private readonly companyRepository: Repository<CompanyEntity>,
    private readonly configService: ConfigService,
  ) {}

  async createCompany(company: createCompanyDto): Promise<CompanyEntity> {
    return this.companyRepository.save({
      name: company.name,
      email: company.email,
      phone: company.phone,
      address: company.address,
      createdBy: company.createdBy,
    });
  }

  async getCompanies(): Promise<CompanyEntity[]> {
    return this.companyRepository.find();
  }

  async getCompanyById(companyId: string): Promise<CompanyEntity | null> {
    return this.companyRepository.findOne({
      where: { id: companyId },
    });
  }
}
