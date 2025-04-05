import { Test, TestingModule } from '@nestjs/testing';
import { TareaController } from './tarea.controller';
import { TareaService } from './tarea.service';


describe('TareaController', () => {
  let controller: TareaController;

  const mockTareaService = {
    // Aquí podrías definir funciones simuladas si se requieren para otras pruebas
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TareaController],
      providers: [
        {
          provide: TareaService,
          useValue: mockTareaService,
        },
      ],
    }).compile();

    controller = module.get<TareaController>(TareaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
