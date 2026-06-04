import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LogInteracaoTypeOrmRepository } from './log-interacao.typeorm.repository';
import { LogInteracao } from '../../entities/log-interacao.entity';
import { ILogInteracaoRepository } from '../log-interacao.repository.interface';

describe('LogInteracaoTypeOrmRepository', () => {
  let repository: LogInteracaoTypeOrmRepository;
  let mockTypeOrmRepository: jest.Mocked<Repository<LogInteracao>>;

  const logMock: LogInteracao = {
    id: '55555555-5555-5555-5555-555555555555',
    usuarioId: 'user-1',
    cursoId: '11111111-1111-1111-1111-111111111111',
    pergunta: 'Qual é o tema?',
    resposta: 'O tema é...',
    confianca: 0.9,
    fontes: null,
    tempoResposta: 100,
    sessionId: 'session-123',
    criadoEm: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LogInteracaoTypeOrmRepository,
        {
          provide: getRepositoryToken(LogInteracao),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    repository = module.get<LogInteracaoTypeOrmRepository>(LogInteracaoTypeOrmRepository);
    mockTypeOrmRepository = module.get<jest.Mocked<Repository<LogInteracao>>>(
      getRepositoryToken(LogInteracao),
    );
  });

  describe('salvarLog', () => {
    it('deve criar e salvar um novo log', async () => {
      const dto = {
        usuarioId: 'user-1',
        cursoId: '11111111-1111-1111-1111-111111111111',
        pergunta: 'Pergunta?',
        resposta: 'Resposta',
        confianca: 0.8,
        tempoResposta: 100,
        sessionId: 'session-123',
      };

      mockTypeOrmRepository.create.mockReturnValueOnce(logMock);
      mockTypeOrmRepository.save.mockResolvedValueOnce(logMock);

      const result = await repository.salvarLog(dto);

      expect(result).toEqual(logMock);
      expect(mockTypeOrmRepository.create).toHaveBeenCalledWith(dto);
      expect(mockTypeOrmRepository.save).toHaveBeenCalled();
    });
  });

  describe('obterHistorico', () => {
    it('deve retornar histórico ordenado por data descrescente', async () => {
      mockTypeOrmRepository.find.mockResolvedValueOnce([logMock]);

      const result = await repository.obterHistorico('user-1', '11111111-1111-1111-1111-111111111111', 50);

      expect(result).toEqual([logMock]);
      expect(mockTypeOrmRepository.find).toHaveBeenCalledWith({
        where: { usuarioId: 'user-1', cursoId: '11111111-1111-1111-1111-111111111111' },
        order: { criadoEm: 'DESC' },
        take: 50,
      });
    });

    it('deve usar limite padrão de 50 se não fornecido', async () => {
      mockTypeOrmRepository.find.mockResolvedValueOnce([]);

      await repository.obterHistorico('user-1', 'curso-1');

      expect(mockTypeOrmRepository.find).toHaveBeenCalledWith({
        where: { usuarioId: 'user-1', cursoId: 'curso-1' },
        order: { criadoEm: 'DESC' },
        take: 50,
      });
    });

    it('deve retornar array vazio quando não há histórico', async () => {
      mockTypeOrmRepository.find.mockResolvedValueOnce([]);

      const result = await repository.obterHistorico('user-novo', 'curso-novo');

      expect(result).toEqual([]);
    });
  });

  describe('obterLogById', () => {
    it('deve retornar log quando encontrado', async () => {
      mockTypeOrmRepository.findOne.mockResolvedValueOnce(logMock);

      const result = await repository.obterLogById(logMock.id);

      expect(result).toEqual(logMock);
      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { id: logMock.id },
      });
    });

    it('deve retornar null quando log não encontrado', async () => {
      mockTypeOrmRepository.findOne.mockResolvedValueOnce(null);

      const result = await repository.obterLogById('nao-existe');

      expect(result).toBeNull();
    });
  });

  describe('deletarHistorico', () => {
    it('deve deletar histórico e retornar quantidade', async () => {
      mockTypeOrmRepository.delete.mockResolvedValueOnce({ affected: 5 });

      const result = await repository.deletarHistorico('user-1', 'curso-1');

      expect(result).toBe(5);
      expect(mockTypeOrmRepository.delete).toHaveBeenCalledWith({
        usuarioId: 'user-1',
        cursoId: 'curso-1',
      });
    });

    it('deve retornar 0 quando nenhum histórico é deletado', async () => {
      mockTypeOrmRepository.delete.mockResolvedValueOnce({ affected: 0 });

      const result = await repository.deletarHistorico('nao-existe', 'nao-existe');

      expect(result).toBe(0);
    });
  });

  describe('implementação da interface', () => {
    it('deve implementar ILogInteracaoRepository', () => {
      const implementa: ILogInteracaoRepository = repository;
      expect(implementa).toBeDefined();
    });
  });
});
