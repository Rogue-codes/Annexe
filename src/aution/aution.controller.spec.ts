import { Test, TestingModule } from '@nestjs/testing';
import { AutionController } from './aution.controller';
import { AutionService } from './aution.service';

describe('AutionController', () => {
  let controller: AutionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AutionController],
      providers: [AutionService],
    }).compile();

    controller = module.get<AutionController>(AutionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
