import { Test, TestingModule } from '@nestjs/testing';
import { TareaController } from './tarea.controller';
import { TareaService } from './tarea.service';
import { CreateTareaDto } from './dto/create-tarea.dto';
import { Tarea } from './tarea.entity';
import { NotFoundException } from '@nestjs/common';

describe('TareaController', () => {
  let controller: TareaController;
  let service: jest.Mocked<TareaService>;
  const fecha = new Date();

  const mockTareas: Tarea[] = [
    { id: 1, title: 'Tarea 1', content: 'Contenido 1', completed: false, createdAt: fecha },
    { id: 2, title: 'Tarea 2', content: 'Contenido 2', completed: false, createdAt: fecha },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TareaController],
      providers: [
        {
          provide: TareaService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            findByTitle: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TareaController>(TareaController);
    service = module.get(TareaService);
  });

  it('Controller should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create()', () => {
    it('should create and return a tarea', async () => {
      const dto: CreateTareaDto = { title: 'Nueva Tarea', content: 'Contenido' };
      const tarea: Tarea = { id: 3, ...dto, completed: false, createdAt: fecha };

      service.create.mockResolvedValue(tarea);

      const result = await controller.create(dto);
      expect(result).toEqual(tarea);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll()', () => {
    it('should return all tareas', async () => {
      service.findAll.mockResolvedValue(mockTareas);

      const result = await controller.findAll();
      expect(result).toEqual(mockTareas);
    });
  });

  describe('findOne()', () => {
    it('should return one tarea by ID', async () => {
      service.findOne.mockResolvedValue(mockTareas[0]);

      const result = await controller.findOne('1');
      expect(result).toEqual(mockTareas[0]);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if not found', async () => {
      service.findOne.mockRejectedValue(new NotFoundException());

      await expect(controller.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update()', () => {
    const updateDto: CreateTareaDto = {
      title: 'Actualizado',
      content: 'Contenido actualizado',
    };

    it('should update and return a tarea', async () => {
      const updated = { ...mockTareas[0], ...updateDto };
      service.update.mockResolvedValue(updated);

      const result = await controller.update('1', updateDto);
      expect(result).toEqual(updated);
      expect(service.update).toHaveBeenCalledWith(1, updateDto);
    });

    it('should throw NotFoundException if update fails', async () => {
      service.update.mockRejectedValue(new NotFoundException());

      await expect(controller.update('999', updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove()', () => {
    it('should remove a tarea by ID', async () => {
      service.remove.mockResolvedValue(undefined);

      await controller.remove('1');
      expect(service.remove).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if not found', async () => {
      service.remove.mockRejectedValue(new NotFoundException());

      await expect(controller.remove('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByTitle()', () => {
    it('should return tareas matching a title', async () => {
      service.findByTitle.mockResolvedValue([mockTareas[0]]);

      const result = await controller.findByTitle('Tarea 1');
      expect(result).toEqual([mockTareas[0]]);
      expect(service.findByTitle).toHaveBeenCalledWith('Tarea 1');
    });

    it('should throw NotFoundException if no tasks match title', async () => {
      service.findByTitle.mockRejectedValue(new NotFoundException());

      await expect(controller.findByTitle('No existe')).rejects.toThrow(NotFoundException);
    });
  });
});
