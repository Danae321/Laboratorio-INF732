import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Tarea } from '../src/tarea/tarea.entity';
import { Repository, DataSource } from 'typeorm';
import { CreateTareaDto } from 'src/tarea/dto/create-tarea.dto';

describe('TareaController (e2e)', () => {
  let app: INestApplication;
  let tareaRepository: Repository<Tarea>;

  // Setup the application before tests
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    tareaRepository = moduleFixture.get<Repository<Tarea>>(
      getRepositoryToken(Tarea),
    );

    await app.init();
  });

  // Cleanup after all tests
  afterAll(async () => {
    await app.close();
    const dataSource = app.get(DataSource);
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  });

  // Clean database after each test
  afterEach(async () => {
    await tareaRepository.clear();
  });

  // Tests for POST /tareas (Create Tarea)
  describe('/tareas (POST)', () => {
    it('should create a new task', async () => {
      const createTareaDto = {
        title: 'Tarea de prueba',
        content: 'Este es el contenido de prueba',
      };

      const response = await request(app.getHttpServer())
        .post('/tarea')
        .send(createTareaDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toEqual(createTareaDto.title);
      expect(response.body.content).toEqual(createTareaDto.content);
    });

    it('should fail if title is not provided', async () => {
      const invalidDto = { content: 'Content without title' } as CreateTareaDto;

      const response = await request(app.getHttpServer())
        .post('/tarea')
        .send(invalidDto)
        .expect(400);

      expect(response.body.message).toContain('The title is required');
    });

    it('should fail if content is not provided', async () => {
      const invalidDto = { title: 'Title without content' } as CreateTareaDto;

      const response = await request(app.getHttpServer())
        .post('/tarea')
        .send(invalidDto)
        .expect(400);

      expect(response.body.message).toContain('The content is required');
    });
  });

  // Tests for GET /tareas (Get all Tareas)
  describe('/tareas (GET)', () => {
    it('should return all tasks', async () => {
      const tarea1 = { title: 'Tarea 1', content: 'Contenido 1' };
      const tarea2 = { title: 'Tarea 2', content: 'Contenido 2' };
      await tareaRepository.save(tarea1);
      await tareaRepository.save(tarea2);

      const response = await request(app.getHttpServer())
        .get('/tarea')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0].title).toEqual(tarea1.title);
      expect(response.body[1].title).toEqual(tarea2.title);
    });
  });

  // Tests for GET /tareas/:id (Get Tarea by ID)
  describe('/tareas/:id (GET)', () => {
    it('should return a task by ID', async () => {
      const tareaDto = { title: 'Tarea de prueba', content: 'Contenido de prueba' };
      const tarea = await tareaRepository.save(tareaDto);

      const response = await request(app.getHttpServer())
        .get(`/tarea/${tarea.id}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toEqual(tareaDto.title);
    });

    it('should return a 404 error if task not found', async () => {
      const response = await request(app.getHttpServer())
        .get('/tarea/999')
        .expect(404);

      expect(response.body.message).toContain('Tarea con ID 999 no encontrada');
    });
  });

  // Tests for PUT /tareas/:id (Update Tarea)
  describe('/tareas/:id (PUT)', () => {
    it('should update an existing task', async () => {
      const tareaDto = { title: 'Tarea de prueba', content: 'Contenido de prueba' };
      const tarea = await tareaRepository.save(tareaDto);

      const updatedTareaDto = {
        title: 'Tarea actualizada',
        content: 'Contenido actualizado',
      };

      const response = await request(app.getHttpServer())
        .put(`/tarea/${tarea.id}`)
        .send(updatedTareaDto)
        .expect(200);

      expect(response.body.title).toEqual(updatedTareaDto.title);
      expect(response.body.content).toEqual(updatedTareaDto.content);
    });

    it('should return a 404 error if task not found', async () => {
      const updateDto = { title: 'Tarea actualizada', content: 'Contenido actualizado' };

      const response = await request(app.getHttpServer())
        .put('/tarea/999')
        .send(updateDto)
        .expect(404);

      expect(response.body.message).toContain('Tarea con ID 999 no encontrada');
    });
  });

  // Tests for DELETE /tareas/:id (Delete Tarea)
  describe('/tareas/:id (DELETE)', () => {
    it('should delete an existing task', async () => {
      const tareaDto = { title: 'Tarea de prueba', content: 'Contenido de prueba' };
      const tarea = await tareaRepository.save(tareaDto);

      const response = await request(app.getHttpServer())
        .delete(`/tarea/${tarea.id}`)
        .expect(200);

      expect(response.status).toBe(200);
    });

    it('should return a 404 error if task not found', async () => {
      const response = await request(app.getHttpServer())
        .delete('/tarea/999')
        .expect(404);

      expect(response.body.message).toContain('Tarea con ID 999 no encontrada');
    });
  });

  // Tests for GET /tareas/:title (Get Tareas by Title)
  describe('/tareas/:title (GET)', () => {
    it('should return tasks by title', async () => {
      const tarea1 = { title: 'Tarea prueba', content: 'Contenido prueba' };
      const tarea2 = { title: 'Otra Tarea prueba', content: 'Otro contenido' };
      await tareaRepository.save(tarea1);
      await tareaRepository.save(tarea2);

      const response = await request(app.getHttpServer())
        .get('/tarea/titulo/Tarea prueba')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].title).toEqual(tarea1.title);
    });

    it('should return a 404 error if no tasks with given title', async () => {
        const response = await request(app.getHttpServer())
          .get('/tarea/titulo/inexistente')  // Título que no existe
          .expect(404);  // Esperamos que devuelva un 404
        expect(response.body.message).toContain('Tarea con el título inexistente no encontrada');
      });      
  });
});
