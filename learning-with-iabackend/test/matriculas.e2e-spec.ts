import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from './../src/app.module';
import { User, UserRole } from './../src/modules/users/entities/user.entity';
import { Curso, CursoStatus } from './../src/modules/cursos/entities/curso.entity';
import { Matricula } from './../src/modules/matriculas/entities/matricula.entity';

describe('MatriculasController (e2e) — POST /api/v1/matriculas', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let jwtService: JwtService;

  let studentUser: User;
  let adminUser: User;
  let cursoAtivo: Curso;
  let cursoInativo: Curso;

  const signToken = (user: User): string =>
    jwtService.sign({ sub: user.id, email: user.email, role: user.role });

  beforeEach(async () => {
    process.env.NODE_ENV = 'test';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    dataSource = app.get(DataSource);
    jwtService = app.get(JwtService);

    await dataSource.query('TRUNCATE TABLE "matriculas" CASCADE;');
    await dataSource.query('TRUNCATE TABLE "users" CASCADE;');
    await dataSource.query('TRUNCATE TABLE "cursos" CASCADE;');

    const usersRepo = dataSource.getRepository(User);
    studentUser = await usersRepo.save(
      usersRepo.create({
        name: 'Aluno Teste',
        email: 'aluno@example.com',
        password: 'hashed',
        role: UserRole.STUDENT,
      }),
    );
    adminUser = await usersRepo.save(
      usersRepo.create({
        name: 'Admin Teste',
        email: 'admin@example.com',
        password: 'hashed',
        role: UserRole.ADMIN,
      }),
    );

    const cursosRepo = dataSource.getRepository(Curso);
    cursoAtivo = await cursosRepo.save(
      cursosRepo.create({
        nome: 'Curso Ativo',
        descricao: 'Disponível para matrícula',
        cargaHoraria: 40,
        status: CursoStatus.ATIVO,
      }),
    );
    cursoInativo = await cursosRepo.save(
      cursosRepo.create({
        nome: 'Curso Inativo',
        descricao: 'Indisponível (RN03)',
        cargaHoraria: 30,
        status: CursoStatus.INATIVO,
      }),
    );
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  it('deve retornar 401 quando a requisição não tem token de autenticação', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/matriculas')
      .send({ usuarioId: studentUser.id, cursoId: cursoAtivo.id })
      .expect(401);
  });

  it('deve retornar 403 quando o token pertence a um usuário sem papel STUDENT (ex: ADMIN)', async () => {
    const adminToken = signToken(adminUser);

    await request(app.getHttpServer())
      .post('/api/v1/matriculas')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ usuarioId: studentUser.id, cursoId: cursoAtivo.id })
      .expect(403);
  });

  it('deve retornar 201 e o objeto criado quando o token é de um STUDENT e o curso está ATIVO', async () => {
    const studentToken = signToken(studentUser);

    const response = await request(app.getHttpServer())
      .post('/api/v1/matriculas')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ usuarioId: studentUser.id, cursoId: cursoAtivo.id })
      .expect(201);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        usuarioId: studentUser.id,
        cursoId: cursoAtivo.id,
        ativa: true,
      }),
    );
    expect(response.body).toHaveProperty('criadoEm');

    const matriculasRepo = dataSource.getRepository(Matricula);
    const persistida = await matriculasRepo.findOne({ where: { id: response.body.id } });
    expect(persistida).not.toBeNull();
    expect(persistida?.ativa).toBe(true);
  });

  it('deve retornar 404 quando o cursoId não existe (RN03 — curso inexistente)', async () => {
    const studentToken = signToken(studentUser);
    const idInexistente = '00000000-0000-0000-0000-000000000000';

    await request(app.getHttpServer())
      .post('/api/v1/matriculas')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ usuarioId: studentUser.id, cursoId: idInexistente })
      .expect(404);
  });

  it('deve retornar 400 quando o curso existe mas está INATIVO (RN03 — curso indisponível)', async () => {
    const studentToken = signToken(studentUser);

    await request(app.getHttpServer())
      .post('/api/v1/matriculas')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ usuarioId: studentUser.id, cursoId: cursoInativo.id })
      .expect(400);
  });

  it('deve retornar 400 quando o payload é inválido (cursoId não é UUID)', async () => {
    const studentToken = signToken(studentUser);

    await request(app.getHttpServer())
      .post('/api/v1/matriculas')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ usuarioId: studentUser.id, cursoId: 'not-a-uuid' })
      .expect(400);
  });
});
