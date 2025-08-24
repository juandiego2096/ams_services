import { Test, TestingModule } from '@nestjs/testing';
import { SpecieController } from './specie.controller';
import { SpecieService } from './specie.service';

describe('SpecieController', () => {
  let controller: SpecieController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SpecieController],
      providers: [SpecieService],
    }).compile();

    controller = module.get<SpecieController>(SpecieController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
