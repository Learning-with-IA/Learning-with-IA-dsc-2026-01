import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AppModule } from './../src/app.module';
import { User, UserRole } from './../src/modules/users/entities/user.entity';
import { Curso, CursoStatus } from './../src/modules/cursos/entities/curso.entity';
import { CursoAgente, ModeloIA } from './../src/modules/cursos/entities/curso-agente.entity';
import { Matricula } from './../src/modules/matriculas/entities/matricula.entity';
import { LogInteracao } from './../src/modules/cursos/entities/log-interacao.entity';

describe('IaController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let studentToken: string;
  let studentId: string;
  let cursoId: string;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.OPENAI_API_KEY = 'test_openai_key';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = app.get(DataSource);
  });

  beforeEach(async () => {
    // Limpar tabelas de forma segura
    await dataSource.query('TRUNCATE TABLE "log_interacao" CASCADE;');
    await dataSource.query('TRUNCATE TABLE "matriculas" CASCADE;');
    await dataSource.query('TRUNCATE TABLE "curso_agente" CASCADE;');
    await dataSource.query('TRUNCATE TABLE "cursos" CASCADE;');
    await dataSource.query('TRUNCATE TABLE "users" CASCADE;');

    const userRepository = dataSource.getRepository(User);
    const cursoRepository = dataSource.getRepository(Curso);
    const agenteRepository = dataSource.getRepository(CursoAgente);

    // Criar estudante
    const hashedPassword = await bcrypt.hash('password123', 10);
    const student = await userRepository.save(
      userRepository.create({
        name: 'Student User',
        email: 'student@example.com',
        password: hashedPassword,
        role: UserRole.STUDENT,
        isActive: true,
      }),
    );
    studentId = student.id;

    // Login do estudante
    const studentLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'student@example.com', password: 'password123' });
    studentToken = studentLogin.body.accessToken;

    // Criar curso ativo
    const curso = await cursoRepository.save(
      cursoRepository.create({
        nome: 'Curso de IA',
        descricao: 'Curso para testar agente',
        cargaHoraria: 10,
        status: CursoStatus.ATIVO,
      }),
    );
    cursoId = curso.id;

    // Criar agente com conteúdo de treinamento
    await agenteRepository.save(
      agenteRepository.create({
        cursoId: cursoId,
        modeloIA: ModeloIA.GPT_3_5,
        temperatura: 0.7,
        maxTokens: 1000,
        conteudoTreinamento: 'Este é o conteúdo consolidado do curso para o agente responder.',
        ativo: true,
      }),
    );
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('POST /api/v1/ia/chat - deve proibir acesso não autenticado (401)', async () => {
    const payload = {
      pergunta: 'Como funciona o curso?',
      sessionId: 'session-123',
      cursoId: cursoId,
    };

    await request(app.getHttpServer())
      .post('/api/v1/ia/chat')
      .send(payload)
      .expect(401);
  });

  it('POST /api/v1/ia/chat - deve retornar 403 se o aluno não estiver matriculado', async () => {
    const payload = {
      pergunta: 'Como funciona o curso?',
      sessionId: 'session-123',
      cursoId: cursoId,
    };

    const response = await request(app.getHttpServer())
      .post('/api/v1/ia/chat')
      .set('Authorization', `Bearer ${studentToken}`)
      .send(payload)
      .expect(403);

    expect(response.body.message).toBe('Apenas alunos com matrícula ativa podem usar o agente');
  });

  it('POST /api/v1/ia/chat - deve retornar 403 se o aluno tiver matrícula inativa', async () => {
    const matriculaRepository = dataSource.getRepository(Matricula);
    await matriculaRepository.save(
      matriculaRepository.create({
        usuarioId: studentId,
        cursoId: cursoId,
        ativa: false,
      }),
    );

    const payload = {
      pergunta: 'Como funciona o curso?',
      sessionId: 'session-123',
      cursoId: cursoId,
    };

    const response = await request(app.getHttpServer())
      .post('/api/v1/ia/chat')
      .set('Authorization', `Bearer ${studentToken}`)
      .send(payload)
      .expect(403);

    expect(response.body.message).toBe('Apenas alunos com matrícula ativa podem usar o agente');
  });

  it('POST /api/v1/ia/chat - deve permitir consulta se o aluno tiver matrícula ativa, e persistir log no banco com sessionId', async () => {
    const matriculaRepository = dataSource.getRepository(Matricula);
    await matriculaRepository.save(
      matriculaRepository.create({
        usuarioId: studentId,
        cursoId: cursoId,
        ativa: true,
      }),
    );

    const payload = {
      pergunta: 'Como funciona o curso?',
      sessionId: 'session-e2e-abc-123',
      cursoId: cursoId,
    };

    const response = await request(app.getHttpServer())
      .post('/api/v1/ia/chat')
      .set('Authorization', `Bearer ${studentToken}`)
      .send(payload)
      .expect(200);

    // Verificar se resposta simulada da OpenAI veio corretamente
    expect(response.body).toHaveProperty('resposta');
    expect(response.body.resposta).toContain('[SIMULADO] Resposta baseada em conteúdo');
    expect(response.body.pergunta).toBe(payload.pergunta);

    // Verificar se salvou o log com sessionId correto no banco de dados
    const logRepository = dataSource.getRepository(LogInteracao);
    const logs = await logRepository.find({ where: { usuarioId: studentId, cursoId: cursoId } });
    
    expect(logs).toHaveLength(1);
    expect(logs[0].sessionId).toBe('session-e2e-abc-123');
    expect(logs[0].pergunta).toBe(payload.pergunta);
    expect(logs[0].resposta).toBe(response.body.resposta);
  });
});
