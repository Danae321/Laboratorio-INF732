import { Repository } from 'typeorm';
import { TareaService } from './tarea.service';
import { Tarea } from './tarea.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';

describe('Tarea Integration Tests', () => {
  let service: TareaService;
  let repository: Repository<Tarea>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'mysql',
          host: 'localhost',
          port: 3306,
          username: 'root',
          password: 'root',
          database: 'tarea_test',
          entities: [Tarea],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([Tarea]),
      ],
      providers: [TareaService],
    }).compile();
    service = module.get<TareaService>(TareaService);
    repository = module.get<Repository<Tarea>>(getRepositoryToken(Tarea));
  });

  afterAll(async () => {
    const connection = repository.manager.connection;
    if (connection.isInitialized) {
      await connection.destroy();
    }
  });

  afterEach(async () => {
    await repository.query('DELETE FROM tarea;');
  });

  it('debería crear una tarea en la base de datos', async () => {
    const nuevaTarea = {
      title: 'Tarea de prueba',
      content: 'Contenido de prueba',
    };

    const tareaCreada = await service.create(nuevaTarea);
    expect(tareaCreada).toHaveProperty('id');
    expect(tareaCreada.title).toBe(nuevaTarea.title);
    expect(tareaCreada.content).toBe(nuevaTarea.content);
    const tareaEnDB = await repository.findOneBy({ id: tareaCreada.id });
    expect(tareaEnDB).not.toBeNull();
    if (tareaEnDB) {
      expect(tareaEnDB.title).toBe(nuevaTarea.title);
      expect(tareaEnDB.content).toBe(nuevaTarea.content);
    }
  });

  it('debería obtener todas las tareas de la base de datos', async () => {
    await repository.save([
      { title: 'Tarea 1', content: 'Contenido 1' },
      { title: 'Tarea 2', content: 'Contenido 2' },
    ]);
    const tareas = await service.findAll();
    expect(tareas.length).toBe(2);
    expect(tareas[0].title).toBe('Tarea 1');
    expect(tareas[1].title).toBe('Tarea 2');
  });

  describe('findOne()', () => {
    it('debería obtener una tarea por ID', async () => {
      const nuevaTarea = await repository.save({
        title: 'Tarea específica',
        content: 'Contenido específico',
      });

      const tareaEncontrada = await service.findOne(nuevaTarea.id);
      expect(tareaEncontrada).toBeDefined();
      expect(tareaEncontrada.title).toEqual('Tarea específica');
      expect(tareaEncontrada.content).toEqual('Contenido específico');
    });

    it('debería lanzar NotFoundException al no encontrar una tarea por ID', async () => {
      const tareaInexistente = 999;
      try {
        await service.findOne(tareaInexistente);
        fail('Se esperaba que lanzara NotFoundException');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe('update()', () => {
    it('debería actualizar una tarea existente', async () => {
      const nuevaTarea = await repository.save({
        title: 'Tarea antes de actualizar',
        content: 'Contenido antes de actualizar',
      });

      const tareaActualizada = await service.update(nuevaTarea.id, {
        title: 'Tarea actualizada',
        content: 'Contenido actualizado',
      });

      expect(tareaActualizada).toBeDefined();
      expect(tareaActualizada.title).toEqual('Tarea actualizada');
      expect(tareaActualizada.content).toEqual('Contenido actualizado');
      const tareaEnDB = await repository.findOneBy({ id: nuevaTarea.id });
      expect(tareaEnDB).not.toBeNull();
      if (tareaEnDB) {
        expect(tareaEnDB.title).toEqual(tareaActualizada.title);
        expect(tareaEnDB.content).toEqual(tareaActualizada.content);
      }
    });

    it('debería lanzar NotFoundException al no encontrar una tarea para modificar', async () => {
      const tareaInexistente = 999;
      try {
        await service.update(tareaInexistente, {
          title: 'Tarea actualizada',
          content: 'Contenido actualizado',
        });
        fail('Se esperaba que lanzara NotFoundException');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe('remove()', () => {
    it('debería eliminar una tarea existente', async () => {
      const tareaExistente = await repository.save({
        title: 'Tarea para eliminar',
        content: 'Contenido para eliminar',
      });

      await service.remove(tareaExistente.id);
      const tareaEliminada = await repository.findOneBy({
        id: tareaExistente.id,
      });
      expect(tareaEliminada).toBeNull();
    });

    it('debería lanzar NotFoundException al intentar eliminar una tarea inexistente', async () => {
      const idInexistente = 9999;
      await expect(service.remove(idInexistente)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  it('debería buscar las tareas por título', async () => {
    await repository.save([
      { title: 'Tarea con título específico', content: 'Contenido 1' },
      { title: 'Tarea con otro título', content: 'Contenido 2' },
    ]);

    const tareas = await service.findByTitle('específico');
    expect(tareas.length).toBe(1);
    expect(tareas[0].title).toBe('Tarea con título específico');
  });
});
