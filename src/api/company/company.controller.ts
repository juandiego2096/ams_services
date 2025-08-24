import { Body, Controller, Get, Param, Patch, Post, HttpException, HttpStatus, UseGuards, Request } from '@nestjs/common';
import { CompanyService } from './company.service';
import { createCompanyDto } from './company.type';
import { AuthGuard } from '../auth/auth.guard';
import { ROLES } from '@constants/roles';
import { CompanyEntity } from '@entities/company.entity';

@UseGuards(AuthGuard)
@Controller('companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post('createCompany')
  async createCompany(@Request() req, @Body() newCompany: createCompanyDto): Promise<CompanyEntity> {
    if (req.userRole !== ROLES.SUPER_ADMIN) {
      throw new HttpException('User not enabled to create a company', HttpStatus.UNAUTHORIZED);
    }

    newCompany.createdBy = req.userId;
    return await this.companyService.createCompany(newCompany);
  }

  @Get('getCompanies')
  async getCompanies(): Promise<CompanyEntity[]> {
    return await this.companyService.getCompanies();
  }

  @Get('getCompanyById/:companyId')
  async getCompanyById(@Param('companyId') companyId: string): Promise<CompanyEntity | HttpException | null> {
    const companyFound = await this.companyService.getCompanyById(companyId);

    if (companyFound) {
      return new HttpException('Company not found', HttpStatus.NOT_FOUND);
    }

    return companyFound;
  }
}
