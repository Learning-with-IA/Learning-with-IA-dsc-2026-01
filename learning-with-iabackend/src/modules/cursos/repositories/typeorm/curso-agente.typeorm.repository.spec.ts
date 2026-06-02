import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CursoAgenteTypeOrmRepository } from './curso-agente.typeorm.repository';
import { CursoAgente } from '../../entities/curso-agente.entity';
import { ICursoAgenteRepository } from '../curso-agente.repository.interface';

describe('CursoAgenteTypeOrmRepository', () => {
  let repository: CursoAgenteTypeOrmRepository;
  let mockTypeOrmRepository: jest.Mocked<Repository<CursoAgente>>;

  const agenteMock: CursoAgente = {
    id: '44444444-4444-4444-4444-444444444444',
    cursoId: '11111111-1111-1111-1111-111111111111',
    modeloIA: 'GPT_3_5' as any,
    systemPrompt: 'Prompt de teste',
    temperatura: 0.7,
    maxTokens: 2000,
    conteudoTreinamento: 'Conteúdo consolidado',
    ativo: true,
    versao: 0,
    criadoEm: new Date(),
    atualizadoEm: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CursoAgenteTypeOrmRepository,
        {
          provide: getRepositoryToken(CursoAgente),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            findOneBy: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    repository = module.get<CursoAgenteTypeOrmRepository>(CursoAgenteTypeOrmRepository);
    mockTypeOrmRepository = module.get<jest.Mocked<Repository<CursoAgente>>>(
      getRepositoryToken(CursoAgente),
    );
  });

  describe('obterAgentePorCurso', () => {
    it('deve retornar agente quando encontrado', async () => {
      mockTypeOrmRepository.findOne.mockResolvedValueOnce(agenteMock);

      const result = await repository.obterAgentePorCurso(agenteMock.cursoId);

      expect(result).toEqual(agenteMock);
      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { cursoId: agenteMock.cursoId },
      });
    });

    it('deve retornar null quando agente não encontrado', async () => {
      mockTypeOrmRepository.findOne.mockResolvedValueOnce(null);

      const result = await repository.obterAgentePorCurso('curso-sem-agente');

      expect(result).toBeNull();
    });
  });

  describe('salvarAgente', () => {
    it('deve criar e salvar um novo agente', async () => {
      const dto = {
        cursoId: '11111111-1111-1111-1111-111111111111',
        systemPrompt: 'Novo prompt',
        modeloIA: 'GPT_4' as any,
      };

      mockTypeOrmRepository.create.mockReturnValueOnce(agenteMock);
      mockTypeOrmRepository.save.mockResolvedValueOnce(agenteMock);

      const result = await repository.salvarAgente(dto);

      expect(result).toEqual(agenteMock);
      expect(mockTypeOrmRepository.create).toHaveBeenCalledWith(dto);
      expect(mockTypeOrmRepository.save).toHaveBeenCalled();
    });
  });

  describe('atualizarAgente', () => {
    it('deve atualizar agente e retornar versão atualizada', async () => {
      const dados = { versao: 1, conteudoTreinamento: 'Novo conteúdo' };
      mockTypeOrmRepository.update.mockResolvedValueOnce({ affected: 1 });
      mockTypeOrmRepository.findOneBy.mockResolvedValueOnce(agenteMock);

      const result = await repository.atualizarAgente(agenteMock.cursoId, dados);

      expect(result).toEqual(agenteMock);
      expect(mockTypeOrmRepository.update).toHaveBeenCalledWith({ cursoId: agenteMock.cursoId }, dados);
      expect(mockTypeOrmRepository.findOneBy).toHaveBeenCalledWith({ cursoId: agenteMock.cursoId });
    });
  });

  describe('deletarAgente', () => {
    it('deve deletar agente e retornar true', async () => {
      mockTypeOrmRepository.delete.mockResolvedValueOnce({ affected: 1 });

      const result = await repository.deletarAgente(agenteMock.cursoId);

      expect(result).toBe(true);
      expect(mockTypeOrmRepository.delete).toHaveBeenCalledWith({ cursoId: agenteMock.cursoId });
    });

    it('deve retornar false quando agente não é deletado', async () => {
      mockTypeOrmRepository.delete.mockResolvedValueOnce({ affected: 0 });

      const result = await repository.deletarAgente('nao-existe');

      expect(result).toBe(false);
    });
  });

  describe('implementação da interface', () => {
    it('deve implementar ICursoAgenteRepository', () => {
      const implementa: ICursoAgenteRepository = repository;
      expect(implementa).toBeDefined();
    });
  });
});
