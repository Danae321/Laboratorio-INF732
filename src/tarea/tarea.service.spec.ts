import { Test, TestingModule } from '@nestjs/testing';
import { TareaService } from './tarea.service';
import { Tarea } from './tarea.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// MOCK del repositorio
const mockTareaRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOneBy: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

describe('TareaService', () => {
  let service: TareaService;
  let repository: Partial<Repository<Tarea>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TareaService,
        {
          provide: getRepositoryToken(Tarea),
          useValue: mockTareaRepository(),
        },
      ],
    }).compile();

    service = module.get<TareaService>(TareaService);
    repository = module.get(getRepositoryToken(Tarea));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Aquí puedes agregar más tests como hiciste con NotaService
});
