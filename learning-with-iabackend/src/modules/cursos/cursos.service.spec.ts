import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CursosService } from './cursos.service';
import { Curso, CursoStatus } from './entities/curso.entity';
import { CursoConteudo } from './entities/curso-conteudo.entity';
import { CursoAgente, ModeloIA } from './entities/curso-agente.entity';
import { LogInteracao } from './entities/log-interacao.entity';
import { ICursoRepository } from './repositories/curso.repository.interface';
import { ICursoConteudoRepository } from './repositories/curso-conteudo.repository.interface';
import { ICursoAgenteRepository } from './repositories/curso-agente.repository.interface';
import { ILogInteracaoRepository } from './repositories/log-interacao.repository.interface';

// Tokens abstratos para DI
const CURSO_REPOSITORY_TOKEN = 'ICursoRepository';
const CONTEUDO_REPOSITORY_TOKEN = 'ICursoConteudoRepository';
const AGENTE_REPOSITORY_TOKEN = 'ICursoAgenteRepository';
const LOG_REPOSITORY_TOKEN = 'ILogInteracaoRepository';

describe('CursosService', () => {
  let service: CursosService;
  let mockCursoRepository: jest.Mocked<ICursoRepository>;
  let mockConteudoRepository: jest.Mocked<ICursoConteudoRepository>;
  let mockAgenteRepository: jest.Mocked<ICursoAgenteRepository>;
  let mockLogRepository: jest.Mocked<ILogInteracaoRepository>;

  const cursoAtivo: Curso = {
    id: '11111111-1111-1111-1111-111111111111',
    nome: 'Curso Ativo',
    descricao: 'Descrição ativa',
    cargaHoraria: 20,
    imagemUrl: 'https://example.com/ativo.png',
    status: CursoStatus.ATIVO,
    criadoEm: new Date(),
    atualizadoEm: new Date(),
    validateStatus: () => {},
  } as any;

  const cursoInativo: Curso = {
    id: '22222222-2222-2222-2222-222222222222',
    nome: 'Curso Inativo',
    descricao: 'Descrição inativa',
    cargaHoraria: 10,
    imagemUrl: null,
    status: CursoStatus.INATIVO,
    criadoEm: new Date(),
    atualizadoEm: new Date(),
    validateStatus: () => {},
  } as any;

  const conteudoMock: CursoConteudo = {
    id: '33333333-3333-3333-3333-333333333333',
    cursoId: '11111111-1111-1111-1111-111111111111',
    titulo: 'Conteúdo 1',
    conteudo: 'Conteúdo de teste',
    tipo: 'TEXTO' as any,
    ordem: 1,
    ativo: true,
    criadoEm: new Date(),
    atualizadoEm: new Date(),
    curso: cursoAtivo,
  } as any;

  const agenteMock: CursoAgente = {
    id: '44444444-4444-4444-4444-444444444444',
    cursoId: '11111111-1111-1111-1111-111111111111',
    modeloIA: ModeloIA.GPT_3_5,
    systemPrompt: 'Prompt de teste',
    temperatura: 0.7,
    maxTokens: 2000,
    conteudoTreinamento: 'Conteúdo consolidado',
    ativo: true,
    versao: 0,
    criadoEm: new Date(),
    atualizadoEm: new Date(),
    curso: cursoAtivo,
  } as any;

  beforeEach(async () => {
    mockCursoRepository = {
      listarCursosAtivos: jest.fn(),
      obterCursoById: jest.fn(),
      salvarCurso: jest.fn(),
      deletarCurso: jest.fn(),
    };

    mockConteudoRepository = {
      salvarConteudo: jest.fn(),
      obterConteudoById: jest.fn(),
      obterConteudoByCurso: jest.fn(),
      listarConteudoAtivoPorCurso: jest.fn(),
      atualizarConteudo: jest.fn(),
      deletarConteudo: jest.fn(),
    };

    mockAgenteRepository = {
      obterAgentePorCurso: jest.fn(),
      salvarAgente: jest.fn(),
      atualizarAgente: jest.fn(),
      deletarAgente: jest.fn(),
    };

    mockLogRepository = {
      salvarLog: jest.fn(),
      obterHistorico: jest.fn(),
      obterLogById: jest.fn(),
      deletarHistorico: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CursosService,
        {
          provide: CURSO_REPOSITORY_TOKEN,
          useValue: mockCursoRepository,
        },
        {
          provide: CONTEUDO_REPOSITORY_TOKEN,
          useValue: mockConteudoRepository,
        },
        {
          provide: AGENTE_REPOSITORY_TOKEN,
          useValue: mockAgenteRepository,
        },
        {
          provide: LOG_REPOSITORY_TOKEN,
          useValue: mockLogRepository,
        },
      ],
    }).compile();

    service = module.get<CursosService>(CursosService);
  });

  describe('listarCursosAtivos', () => {
    it('deve retornar apenas cursos com status ATIVO', async () => {
      mockCursoRepository.listarCursosAtivos.mockResolvedValueOnce([cursoAtivo]);

      const result = await service.listarCursosAtivos();

      expect(result).toEqual([cursoAtivo]);
      expect(mockCursoRepository.listarCursosAtivos).toHaveBeenCalled();
    });

    it('deve retornar array vazio quando não há cursos cadastrados', async () => {
      mockCursoRepository.listarCursosAtivos.mockResolvedValueOnce([]);

      const result = await service.listarCursosAtivos();

      expect(result).toEqual([]);
    });

    it('deve filtrar e retornar apenas cursos ATIVOS quando há inativos na base', async () => {
      mockCursoRepository.listarCursosAtivos.mockResolvedValueOnce([cursoAtivo]);

      const result = await service.listarCursosAtivos();

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe(CursoStatus.ATIVO);
      expect(result[0].id).toBe(cursoAtivo.id);
    });

    it('deve retornar múltiplos cursos ATIVOS quando existirem', async () => {
      const outroAtivo: Curso = {
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        nome: 'Outro Curso Ativo',
        descricao: 'Descrição ativa 2',
        cargaHoraria: 30,
        imagemUrl: 'https://example.com/outro-ativo.png',
        status: CursoStatus.ATIVO,
        criadoEm: new Date(),
        atualizadoEm: new Date(),
        validateStatus: () => {},
      } as any;

      mockCursoRepository.listarCursosAtivos.mockResolvedValueOnce([cursoAtivo, outroAtivo]);

      const result = await service.listarCursosAtivos();

      expect(result).toHaveLength(2);
      expect(result).toEqual([cursoAtivo, outroAtivo]);
      expect(result.every(curso => curso.status === CursoStatus.ATIVO)).toBe(true);
    });

    it('deve retornar resultado vazio quando nenhum curso está ATIVO', async () => {
      mockCursoRepository.listarCursosAtivos.mockResolvedValueOnce([]);

      const result = await service.listarCursosAtivos();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('deve chamar o repositório uma única vez', async () => {
      mockCursoRepository.listarCursosAtivos.mockResolvedValueOnce([cursoAtivo]);

      await service.listarCursosAtivos();

      expect(mockCursoRepository.listarCursosAtivos).toHaveBeenCalledTimes(1);
      expect(mockCursoRepository.listarCursosAtivos).toHaveBeenCalledWith();
    });

    it('deve retornar os cursos na ordem correta', async () => {
      const cursoPrimeiro: Curso = {
        id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
        nome: 'Primeiro',
        descricao: 'Primeiro curso',
        cargaHoraria: 10,
        imagemUrl: null,
        status: CursoStatus.ATIVO,
        criadoEm: new Date(2024, 0, 1),
        atualizadoEm: new Date(2024, 0, 1),
        validateStatus: () => {},
      } as any;

      const cursoSegundo: Curso = {
        id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
        nome: 'Segundo',
        descricao: 'Segundo curso',
        cargaHoraria: 20,
        imagemUrl: null,
        status: CursoStatus.ATIVO,
        criadoEm: new Date(2024, 0, 2),
        atualizadoEm: new Date(2024, 0, 2),
        validateStatus: () => {},
      } as any;

      mockCursoRepository.listarCursosAtivos.mockResolvedValueOnce([cursoPrimeiro, cursoSegundo]);

      const result = await service.listarCursosAtivos();

      expect(result[0].id).toBe(cursoPrimeiro.id);
      expect(result[1].id).toBe(cursoSegundo.id);
    });
  });

  describe('obterCurso', () => {
    it('deve retornar um curso quando encontrado', async () => {
      mockCursoRepository.obterCursoById.mockResolvedValueOnce(cursoAtivo);

      const result = await service.obterCurso(cursoAtivo.id);

      expect(result).toEqual(cursoAtivo);
      expect(mockCursoRepository.obterCursoById).toHaveBeenCalledWith(cursoAtivo.id);
    });

    it('deve lançar NotFoundException quando curso não encontrado', async () => {
      mockCursoRepository.obterCursoById.mockResolvedValueOnce(null);

      await expect(service.obterCurso('nao-existe')).rejects.toThrow(NotFoundException);
    });
  });

  describe('adicionarConteudo', () => {
    it('deve adicionar conteúdo a um curso existente', async () => {
      const dto = {
        titulo: 'Novo Conteúdo',
        conteudo: 'Conteúdo novo',
        tipo: 'TEXTO' as any,
        ordem: 1,
      };

      mockCursoRepository.obterCursoById.mockResolvedValueOnce(cursoAtivo);
      mockConteudoRepository.salvarConteudo.mockResolvedValueOnce(conteudoMock);
      mockConteudoRepository.listarConteudoAtivoPorCurso.mockResolvedValueOnce([conteudoMock]);
      mockAgenteRepository.obterAgentePorCurso.mockResolvedValueOnce(agenteMock);
      mockAgenteRepository.atualizarAgente.mockResolvedValueOnce(agenteMock);

      const result = await service.adicionarConteudo(cursoAtivo.id, dto);

      expect(result).toEqual(conteudoMock);
      expect(mockConteudoRepository.salvarConteudo).toHaveBeenCalled();
    });

    it('deve lançar NotFoundException se curso não existe', async () => {
      const dto = {
        titulo: 'Novo Conteúdo',
        conteudo: 'Conteúdo novo',
        tipo: 'TEXTO' as any,
        ordem: 1,
      };

      mockCursoRepository.obterCursoById.mockResolvedValueOnce(null);

      await expect(service.adicionarConteudo('nao-existe', dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('registrarInteracao', () => {
    it('deve registrar uma interação', async () => {
      const logMock: LogInteracao = {
        id: '55555555-5555-5555-5555-555555555555',
        usuarioId: 'user-1',
        cursoId: cursoAtivo.id,
        pergunta: 'Qual é o tema?',
        resposta: 'O tema é...',
        confianca: 0.9,
        fontes: null,
        tempoResposta: 100,
        criadoEm: new Date(),
        usuario: {} as any,
        curso: cursoAtivo,
      } as any;

      mockLogRepository.salvarLog.mockResolvedValueOnce(logMock);

      const result = await service.registrarInteracao(
        'user-1',
        cursoAtivo.id,
        'Qual é o tema?',
        'O tema é...',
        0.9,
        100,
      );

      expect(result).toEqual(logMock);
      expect(mockLogRepository.salvarLog).toHaveBeenCalled();
    });

    it('deve registrar uma interação com sessionId', async () => {
      const logMockWithSession: LogInteracao = {
        id: '55555555-5555-5555-5555-555555555555',
        usuarioId: 'user-1',
        cursoId: cursoAtivo.id,
        pergunta: 'Qual é o tema?',
        resposta: 'O tema é...',
        confianca: 0.9,
        fontes: null,
        tempoResposta: 100,
        sessionId: 'session-abc-123',
        criadoEm: new Date(),
        usuario: {} as any,
        curso: cursoAtivo,
      } as any;

      mockLogRepository.salvarLog.mockResolvedValueOnce(logMockWithSession);

      // @ts-ignore
      const result = await service.registrarInteracao(
        'user-1',
        cursoAtivo.id,
        'Qual é o tema?',
        'O tema é...',
        0.9,
        100,
        'session-abc-123',
      );

      expect(result).toEqual(logMockWithSession);
      expect(mockLogRepository.salvarLog).toHaveBeenCalledWith(
        expect.objectContaining({
          usuarioId: 'user-1',
          cursoId: cursoAtivo.id,
          pergunta: 'Qual é o tema?',
          resposta: 'O tema é...',
          confianca: 0.9,
          tempoResposta: 100,
          sessionId: 'session-abc-123',
        }),
      );
    });
  });

  describe('obterHistorico', () => {
    it('deve retornar histórico de interações', async () => {
      const logMock: LogInteracao = {
        id: '55555555-5555-5555-5555-555555555555',
        usuarioId: 'user-1',
        cursoId: cursoAtivo.id,
        pergunta: 'Pergunta?',
        resposta: 'Resposta',
        confianca: 0.9,
        fontes: null,
        tempoResposta: 100,
        criadoEm: new Date(),
        usuario: {} as any,
        curso: cursoAtivo,
      } as any;

      mockLogRepository.obterHistorico.mockResolvedValueOnce([logMock]);

      const result = await service.obterHistorico('user-1', cursoAtivo.id, 50);

      expect(result).toEqual([logMock]);
      expect(mockLogRepository.obterHistorico).toHaveBeenCalledWith('user-1', cursoAtivo.id, 50);
    });
  });
});
