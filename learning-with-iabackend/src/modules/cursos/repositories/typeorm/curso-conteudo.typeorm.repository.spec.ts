import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CursoConteudoTypeOrmRepository } from './curso-conteudo.typeorm.repository';
import { CursoConteudo } from '../../entities/curso-conteudo.entity';
import { ICursoConteudoRepository } from '../curso-conteudo.repository.interface';

describe('CursoConteudoTypeOrmRepository', () => {
  let repository: CursoConteudoTypeOrmRepository;
  let mockTypeOrmRepository: jest.Mocked<Repository<CursoConteudo>>;

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
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CursoConteudoTypeOrmRepository,
        {
          provide: getRepositoryToken(CursoConteudo),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            update: jest.fn(),
            findOneBy: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    repository = module.get<CursoConteudoTypeOrmRepository>(CursoConteudoTypeOrmRepository);
    mockTypeOrmRepository = module.get<jest.Mocked<Repository<CursoConteudo>>>(
      getRepositoryToken(CursoConteudo),
    );
  });

  describe('salvarConteudo', () => {
    it('deve criar e salvar um novo conteúdo', async () => {
      const dto = {
        cursoId: '11111111-1111-1111-1111-111111111111',
        titulo: 'Novo Conteúdo',
        conteudo: 'Texto',
        tipo: 'TEXTO' as any,
        ordem: 1,
      };

      mockTypeOrmRepository.create.mockReturnValueOnce(conteudoMock);
      mockTypeOrmRepository.save.mockResolvedValueOnce(conteudoMock);

      const result = await repository.salvarConteudo(dto);

      expect(result).toEqual(conteudoMock);
      expect(mockTypeOrmRepository.create).toHaveBeenCalledWith(dto);
      expect(mockTypeOrmRepository.save).toHaveBeenCalled();
    });
  });

  describe('obterConteudoById', () => {
    it('deve retornar conteúdo quando encontrado', async () => {
      mockTypeOrmRepository.findOne.mockResolvedValueOnce(conteudoMock);

      const result = await repository.obterConteudoById(conteudoMock.id);

      expect(result).toEqual(conteudoMock);
      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { id: conteudoMock.id },
      });
    });

    it('deve retornar null quando não encontrado', async () => {
      mockTypeOrmRepository.findOne.mockResolvedValueOnce(null);

      const result = await repository.obterConteudoById('nao-existe');

      expect(result).toBeNull();
    });
  });

  describe('obterConteudoByCurso', () => {
    it('deve retornar conteúdo do curso específico', async () => {
      mockTypeOrmRepository.findOne.mockResolvedValueOnce(conteudoMock);

      const result = await repository.obterConteudoByCurso(conteudoMock.id, conteudoMock.cursoId);

      expect(result).toEqual(conteudoMock);
      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { id: conteudoMock.id, cursoId: conteudoMock.cursoId },
      });
    });

    it('deve retornar null se conteúdo não pertence ao curso', async () => {
      mockTypeOrmRepository.findOne.mockResolvedValueOnce(null);

      const result = await repository.obterConteudoByCurso('outro-conteudo', 'outro-curso');

      expect(result).toBeNull();
    });
  });

  describe('listarConteudoAtivoPorCurso', () => {
    it('deve retornar conteúdos ativos ordenados', async () => {
      mockTypeOrmRepository.find.mockResolvedValueOnce([conteudoMock]);

      const result = await repository.listarConteudoAtivoPorCurso(conteudoMock.cursoId);

      expect(result).toEqual([conteudoMock]);
      expect(mockTypeOrmRepository.find).toHaveBeenCalledWith({
        where: { cursoId: conteudoMock.cursoId, ativo: true },
        order: { ordem: 'ASC' },
      });
    });

    it('deve retornar array vazio quando não há conteúdos ativos', async () => {
      mockTypeOrmRepository.find.mockResolvedValueOnce([]);

      const result = await repository.listarConteudoAtivoPorCurso('curso-vazio');

      expect(result).toEqual([]);
    });
  });

  describe('atualizarConteudo', () => {
    it('deve atualizar e retornar conteúdo', async () => {
      const dados = { titulo: 'Novo Título' };
      mockTypeOrmRepository.update.mockResolvedValueOnce({ affected: 1 });
      mockTypeOrmRepository.findOneBy.mockResolvedValueOnce(conteudoMock);

      const result = await repository.atualizarConteudo(conteudoMock.id, dados);

      expect(result).toEqual(conteudoMock);
      expect(mockTypeOrmRepository.update).toHaveBeenCalledWith(conteudoMock.id, dados);
      expect(mockTypeOrmRepository.findOneBy).toHaveBeenCalledWith({ id: conteudoMock.id });
    });
  });

  describe('deletarConteudo', () => {
    it('deve deletar conteúdo e retornar true', async () => {
      mockTypeOrmRepository.delete.mockResolvedValueOnce({ affected: 1 });

      const result = await repository.deletarConteudo(conteudoMock.id, conteudoMock.cursoId);

      expect(result).toBe(true);
      expect(mockTypeOrmRepository.delete).toHaveBeenCalledWith({
        id: conteudoMock.id,
        cursoId: conteudoMock.cursoId,
      });
    });

    it('deve retornar false quando conteúdo não é deletado', async () => {
      mockTypeOrmRepository.delete.mockResolvedValueOnce({ affected: 0 });

      const result = await repository.deletarConteudo('nao-existe', 'nao-existe');

      expect(result).toBe(false);
    });
  });

  describe('implementação da interface', () => {
    it('deve implementar ICursoConteudoRepository', () => {
      const implementa: ICursoConteudoRepository = repository;
      expect(implementa).toBeDefined();
    });
  });
});
