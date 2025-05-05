import { Repository } from 'typeorm';
import { NotasService } from './nota.service';
import { Nota } from './nota.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';

describe('Notas Integration Tests', () => {
  let service: NotasService;
  let repository: Repository<Nota>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'mysql',
          host: 'localhost',
          port: 3306,
          username: 'root',
          password: 'root',
          database: 'notas_test', 
          entities: [Nota],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([Nota]),
      ],
      providers: [NotasService],
    }).compile();
    service = module.get<NotasService>(NotasService);
    repository = module.get<Repository<Nota>>(getRepositoryToken(Nota));
  });

  afterAll(async () => {
    const connection = repository.manager.connection;
    if (connection.isInitialized) {
      await connection.destroy();
    }
  });

  afterEach(async () => {
    await repository.query('DELETE FROM nota;');
  });

  it("debería crear una nota en la base de datos", async () => {
    const nuevaNota = {
      title: 'Nota de prueba',
      content: 'Contenido de prueba',
    };

    const notaCreada = await service.create(nuevaNota);
    expect(notaCreada).toHaveProperty('id');
    expect(notaCreada.title).toBe(nuevaNota.title);
    expect(notaCreada.content).toBe(nuevaNota.content);
    const notasEnDB = await repository.findOneBy({ id: notaCreada.id });
    expect(notasEnDB).not.toBeNull();
    if (notasEnDB) {
      expect(notasEnDB.title).toBe(nuevaNota.title);
      expect(notasEnDB.content).toBe(nuevaNota.content);
    }
  });

  it('Deberia obtener todas las notas de la base de datos', async () => {
    await repository.save([
      { title: 'Nota 1', content: 'Contenido 1' },
      { title: 'Nota 2', content: 'Contenido 2' },
    ]);
    const notas = await service.findAll();
    expect(notas.length).toBe(2);
    expect(notas[0].title).toBe('Nota 1');
    expect(notas[1].title).toBe('Nota 2');
  });

  describe('findOne()', () => {
    it('Debería obtener una nota por ID', async () => {
      const nuevaNota = await repository.save({
        title: 'Nota específica',
        content: 'Contenido específico',
      });

      const notaEncontrada = await service.findOne(nuevaNota.id);

      expect(notaEncontrada).toBeDefined();
      expect(notaEncontrada.title).toEqual('Nota específica');
      expect(notaEncontrada.content).toEqual('Contenido específico');
    });

    it('Debería lanzar NotFoundException al no encontrar una nota por ID', async () => {
      const notaInexistente = 999;
      try {
        await service.findOne(notaInexistente);
        fail('Se esperaba que lanzara NotFoundException');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe('update()', () => {
    it('Debería actualizar una nota existente', async () => {
      const nuevaNota = await repository.save({
        title: 'Nota antes de actualizar',
        content: 'Contenido antes de actualizar',
      });

      const notaActualizada = await service.update(nuevaNota.id, {
        title: 'Nota actualizada',
        content: 'Contenido actualizado',
      });

      expect(notaActualizada).toBeDefined();
      expect(notaActualizada.title).toEqual('Nota actualizada');
      expect(notaActualizada.content).toEqual('Contenido actualizado');
      const notasEnDB = await repository.findOneBy({ id: nuevaNota.id });
      expect(notasEnDB).not.toBeNull();
      if (notasEnDB) {
        expect(notasEnDB.title).toEqual(notaActualizada.title);
        expect(notasEnDB.content).toEqual(notaActualizada.content);
      }
    });

    it('Debería lanzar NotFoundException al no encontrar una nota para modificar', async () => {
      const notaInexistente = 999;
      try {
        await service.update(notaInexistente, {
          title: 'Nota actualizada',
          content: 'Contenido actualizado',
        });
        fail('Se esperaba que lanzara NotFoundException');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe('remove()', () => {
    it('Debería eliminar una nota existente', async () => {
      const notaExistente = await repository.save({
        title: 'Nota para eliminar',
        content: 'Contenido para eliminar',
      });

      await service.remove(notaExistente.id);
      const notaEliminada = await repository.findOneBy({
        id: notaExistente.id,
      });
      expect(notaEliminada).toBeNull();
    });

    it('debería lanzar NotFoundException al intentar eliminar una nota inexistente', async () => {
      const idInexistente = 9999;
      await expect(service.remove(idInexistente)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  it('Debería buscar las notas por título', async () => {
    await repository.save([
      { title: 'Nota con título específico', content: 'Contenido 1' },
      { title: 'Nota con otro título', content: 'Contenido 2' },
    ]);

    const notas = await service.findByTitle('específico');
    expect(notas.length).toBe(1);
    expect(notas[0].title).toBe('Nota con título específico');
  });
});
