import { Test, TestingModule } from '@nestjs/testing';
import { AutionService } from './aution.service';

describe('AutionService', () => {
  let service: AutionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AutionService],
    }).compile();

    service = module.get<AutionService>(AutionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
