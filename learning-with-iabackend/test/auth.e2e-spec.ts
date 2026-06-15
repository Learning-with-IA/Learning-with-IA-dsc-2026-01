import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from './../src/app.module';
import { User } from './../src/modules/users/entities/user.entity';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

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
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('/api/v1/auth/signup (POST)', () => {
    it('deve registrar um novo usuário com sucesso', async () => {
      const payload = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'password123',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/signup')
        .send(payload)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe(payload.email);
      expect(response.body.name).toBe(payload.name);
    });

    it('deve retornar 409 se o email já estiver cadastrado', async () => {
      const payload = {
        name: 'Jane Doe 2',
        email: 'jane@example.com',
        password: 'password123',
      };

      await request(app.getHttpServer())
        .post('/api/v1/auth/signup')
        .send(payload)
        .expect(409);
    });
  });

  describe('/api/v1/auth/login (POST)', () => {
    it('deve realizar login e retornar o token JWT', async () => {
      const payload = {
        email: 'jane@example.com',
        password: 'password123',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send(payload)
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
    });

    it('deve retornar 401 para credenciais inválidas', async () => {
      const payload = {
        email: 'jane@example.com',
        password: 'wrongpassword',
      };

      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send(payload)
        .expect(401);
    });
  });

  describe('/api/v1/auth/logout (POST)', () => {
    it('deve invalidar o token e realizar logout com sucesso', async () => {
      // Login para obter token
      const loginResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'jane@example.com',
          password: 'password123',
        });

      const token = loginResponse.body.accessToken;

      // Logout com token
      await request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Tentar usar o mesmo token novamente deve falhar com 401
      await request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(401);
    });
  });

  describe('/api/v1/auth/signup — validação de payload', () => {
    it('deve retornar 400 quando campos obrigatórios estão ausentes', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/signup')
        .send({ name: 'Sem Email Nem Senha' })
        .expect(400);
    });

    it('deve retornar 400 quando a senha é curta demais', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/signup')
        .send({ name: 'Teste', email: 'short@email.com', password: '123' })
        .expect(400);
    });
  });

  describe('/api/v1/auth/profile — rotas protegidas', () => {
    it('deve retornar 401 quando não há token de autenticação', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/auth/profile')
        .expect(401);
    });

    it('deve retornar 200 e dados do usuário com token válido', async () => {
      const loginResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'jane@example.com',
          password: 'password123',
        });

      const token = loginResponse.body.accessToken;

      const response = await request(app.getHttpServer())
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('email');
      expect(response.body.email).toBe('jane@example.com');
    });
  });
});
