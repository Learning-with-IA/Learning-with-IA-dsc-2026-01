import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from './../src/app.module';
import { Curso, CursoStatus } from './../src/modules/cursos/entities/curso.entity';

describe('CursosController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeEach(async () => {
    process.env.NODE_ENV = 'test';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = app.get(DataSource);
    const repository = dataSource.getRepository(Curso);
    await repository.clear();

    await repository.save([
      repository.create({
        nome: 'Curso Ativo',
        descricao: 'Apenas cursos ativos devem ser retornados',
        cargaHoraria: 40,
        imagemUrl: 'https://example.com/ativo.png',
        status: CursoStatus.ATIVO,
      }),
      repository.create({
        nome: 'Curso Inativo',
        descricao: 'Não deve aparecer na resposta',
        cargaHoraria: 20,
        imagemUrl: null,
        status: CursoStatus.INATIVO,
      }),
    ]);
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  it('/api/v1/cursos (GET) deve responder 200 e retornar apenas cursos ativos', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/cursos').expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        nome: 'Curso Ativo',
        descricao: 'Apenas cursos ativos devem ser retornados',
        cargaHoraria: 40,
        imagemUrl: 'https://example.com/ativo.png',
      }),
    );
  });
});
