import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from './../src/app.module';
import { User, UserRole } from './../src/modules/users/entities/user.entity';
import * as bcrypt from 'bcrypt';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let adminToken: string;
  let studentToken: string;
  let studentId: string;
  let adminId: string;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = app.get(DataSource);
    const repository = dataSource.getRepository(User);
    
    // Limpar tabela de usuários antes dos testes
    await repository.query('TRUNCATE TABLE "users" CASCADE;');

    // Criar um admin e um student para testes
    const hashedPassword = await bcrypt.hash('password123', 10);
    const admin = await repository.save(
      repository.create({
        name: 'Admin User',
        email: 'admin@example.com',
        password: hashedPassword,
        role: UserRole.ADMIN,
        isActive: true,
      }),
    );
    adminId = admin.id;

    const student = await repository.save(
      repository.create({
        name: 'Student User',
        email: 'student@example.com',
        password: hashedPassword,
        role: UserRole.STUDENT,
        isActive: true,
      }),
    );
    studentId = student.id;

    // Login do admin
    const adminLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'admin@example.com', password: 'password123' });
    adminToken = adminLogin.body.accessToken;

    // Login do estudante
    const studentLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'student@example.com', password: 'password123' });
    studentToken = studentLogin.body.accessToken;
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('GET /api/v1/users (Listagem Paginada)', () => {
    it('deve permitir que admin liste usuários', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
    });

    it('deve proibir que estudante liste usuários', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);
    });
  });

  describe('GET /api/v1/users/:id (Detalhes)', () => {
    it('deve permitir que estudante veja o próprio perfil', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/users/${studentId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);
    });

    it('deve proibir que estudante veja perfil alheio', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/users/${adminId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);
    });

    it('deve permitir que admin veja perfil de qualquer usuário', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/users/${studentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });

  describe('PATCH /api/v1/users/:id/status (Inativação Lógica)', () => {
    it('deve permitir que admin altere status do usuário', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/users/${studentId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: false })
        .expect(200);

      expect(response.body.isActive).toBe(false);

      // Restaurar para ativo
      await request(app.getHttpServer())
        .patch(`/api/v1/users/${studentId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: true })
        .expect(200);
    });

    it('deve proibir que estudante altere status', async () => {
      await request(app.getHttpServer())
        .patch(`/api/v1/users/${studentId}/status`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ isActive: false })
        .expect(403);
    });
  });
});
