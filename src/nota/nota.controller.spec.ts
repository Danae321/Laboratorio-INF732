import { Test, TestingModule } from '@nestjs/testing';
import { NotasController } from './nota.controller';
import { NotasService } from './nota.service';
import { NotFoundException } from '@nestjs/common';
import { Nota } from './nota.entity';
import { CreateNotaDto } from './dto/create-nota.dto';
import { UpdateNotaDto } from './dto/update-nota.dto';

describe('NotasController', () => {
  let controller: NotasController;
  let service: NotasService;

  beforeEach(async () => {
    const mockService = {
      create: jest.fn(),
      findOne: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      findByTitle: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotasController],
      providers: [
        {
          provide: NotasService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<NotasController>(NotasController);
    service = module.get<NotasService>(NotasService);

    // Limpiar los mocks antes de cada prueba
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('deberia crear una nota', async () => {
      const mockNota: Nota = {
        id: 1,
        title: 'Nota de prueba',
        content: 'Contenido ',
      };
      const createNotaDto: CreateNotaDto = {
        title: 'Nota 1',
        content: 'Contenido ',
      };
      jest.spyOn(service, 'create').mockResolvedValue(mockNota);
      const result = await controller.create(createNotaDto);
      expect(result).toEqual(mockNota);
      expect(service.create).toHaveBeenCalledWith(createNotaDto);
    });
  });

  describe('findAll', () => {
    it('deberia retornar todas las notas', async () => {
      const mockNotas: Nota[] = [
        { id: 1, title: 'Nota 1', content: 'Contenido 1' },
        { id: 2, title: 'Nota 2', content: 'Contenido 2' },
      ];
      jest.spyOn(service, 'findAll').mockResolvedValue(mockNotas);
      const result = await controller.findAll();
      expect(result).toEqual(mockNotas);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('deberia retornar una nota por id', async () => {
      const mockNota: Nota = {
        id: 1,
        title: 'Nota 1',
        content: 'Contenido 1',
      };
      jest.spyOn(service, 'findOne').mockResolvedValue(mockNota);
      const result = await controller.findOne('1');
      expect(result).toEqual(mockNota);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });

    it('deberia lanzar NotFoundException si no se encuentra Nota', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException());

      await expect(controller.findOne('999')).rejects.toThrow(
        NotFoundException,
      );

      expect(service.findOne).toHaveBeenCalledWith(999);
    });
  });

  describe('update', () => {
    it('debería actualizar una nota existente', async () => {
      const mockNota: Nota = {
        id: 1,
        title: 'Nota actualizada',
        content: 'Contenido actualizado',
      };

      const updateNotaDto: UpdateNotaDto = {
        title: 'Nota actualizada',
        content: 'Contenido actualizado',
      };

      jest.spyOn(service, 'update').mockResolvedValue(mockNota);

      const result = await controller.update('1', updateNotaDto);

      expect(result).toEqual(mockNota);
      expect(service.update).toHaveBeenCalledWith(1, updateNotaDto);
    });

    it('debería lanzar NotFoundException si la nota a actualizar no existe', async () => {
      const updateNotaDto: UpdateNotaDto = {
        title: 'Nota actualizada',
      };

      jest.spyOn(service, 'update').mockRejectedValue(new NotFoundException());

      await expect(controller.update('999', updateNotaDto)).rejects.toThrow(
        NotFoundException,
      );

      expect(service.update).toHaveBeenCalledWith(999, updateNotaDto);
    });
  });

  describe('remove', () => {
    it('debería eliminar una nota existente', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue(undefined);

      await controller.remove('1');

      expect(service.remove).toHaveBeenCalledWith(1);
    });

    it('debería lanzar NotFoundException si la nota a eliminar no existe', async () => {
      jest.spyOn(service, 'remove').mockRejectedValue(new NotFoundException());

      await expect(controller.remove('999')).rejects.toThrow(NotFoundException);

      expect(service.remove).toHaveBeenCalledWith(999);
    });
  });

  describe('findByTitle', () => {
    it('debería encontrar notas que coincidan con el título', async () => {
      const mockNotas: Nota[] = [
        { id: 1, title: 'Nota Test', content: 'Contenido 1' },
        { id: 2, title: 'Test Nota', content: 'Contenido 2' },
      ];
      jest.spyOn(service, 'findByTitle').mockResolvedValue(mockNotas);
      const result = await controller.findByTitle('Test');
      expect(result).toEqual(mockNotas);
      expect(service.findByTitle).toHaveBeenCalledWith('Test');
    });
    it('debería devolver un array vacío si no hay notas con ese título', async () => {
      const emptyArray: Nota[] = [];

      jest.spyOn(service, 'findByTitle').mockResolvedValue(emptyArray);

      const result = await controller.findByTitle('NoExiste');

      expect(result).toEqual(emptyArray);
      expect(service.findByTitle).toHaveBeenCalledWith('NoExiste');
    });
  });
});