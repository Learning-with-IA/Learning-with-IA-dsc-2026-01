import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CursoTypeOrmRepository } from './curso.typeorm.repository';
import { Curso, CursoStatus } from '../../entities/curso.entity';
import { ICursoRepository } from '../curso.repository.interface';

describe('CursoTypeOrmRepository', () => {
  let repository: CursoTypeOrmRepository;
  let mockTypeOrmRepository: jest.Mocked<Repository<Curso>>;

  const cursoAtivo: Curso = {
    id: '11111111-1111-1111-1111-111111111111',
    nome: 'Curso Ativo',
    descricao: 'Descrição ativa',
    cargaHoraria: 20,
    imagemUrl: 'https://example.com/ativo.png',
    status: CursoStatus.ATIVO,
    criadoEm: new Date(),
    atualizadoEm: new Date(),
  };

  const cursoInativo: Curso = {
    id: '22222222-2222-2222-2222-222222222222',
    nome: 'Curso Inativo',
    descricao: 'Descrição inativa',
    cargaHoraria: 10,
    imagemUrl: null,
    status: CursoStatus.INATIVO,
    criadoEm: new Date(),
    atualizadoEm: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CursoTypeOrmRepository,
        {
          provide: getRepositoryToken(Curso),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    repository = module.get<CursoTypeOrmRepository>(CursoTypeOrmRepository);
    mockTypeOrmRepository = module.get<jest.Mocked<Repository<Curso>>>(getRepositoryToken(Curso));
  });

  describe('listarCursosAtivos', () => {
    it('deve retornar apenas cursos com status ATIVO', async () => {
      mockTypeOrmRepository.find.mockResolvedValueOnce([cursoAtivo]);

      const result = await repository.listarCursosAtivos();

      expect(result).toEqual([cursoAtivo]);
      expect(mockTypeOrmRepository.find).toHaveBeenCalledWith({
        where: { status: CursoStatus.ATIVO },
      });
    });

    it('deve retornar array vazio quando não há cursos ativos', async () => {
      mockTypeOrmRepository.find.mockResolvedValueOnce([]);

      const result = await repository.listarCursosAtivos();

      expect(result).toEqual([]);
    });
  });

  describe('obterCursoById', () => {
    it('deve retornar um curso quando encontrado', async () => {
      mockTypeOrmRepository.findOne.mockResolvedValueOnce(cursoAtivo);

      const result = await repository.obterCursoById(cursoAtivo.id);

      expect(result).toEqual(cursoAtivo);
      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { id: cursoAtivo.id },
      });
    });

    it('deve retornar null quando curso não encontrado', async () => {
      mockTypeOrmRepository.findOne.mockResolvedValueOnce(null);

      const result = await repository.obterCursoById('nao-existe');

      expect(result).toBeNull();
    });
  });

  describe('salvarCurso', () => {
    it('deve criar e salvar um novo curso', async () => {
      const cursoParcial = {
        nome: 'Novo Curso',
        descricao: 'Descrição',
        cargaHoraria: 30,
      };

      mockTypeOrmRepository.create.mockReturnValueOnce(cursoAtivo);
      mockTypeOrmRepository.save.mockResolvedValueOnce(cursoAtivo);

      const result = await repository.salvarCurso(cursoParcial);

      expect(result).toEqual(cursoAtivo);
      expect(mockTypeOrmRepository.create).toHaveBeenCalledWith(cursoParcial);
      expect(mockTypeOrmRepository.save).toHaveBeenCalledWith(cursoAtivo);
    });
  });

  describe('deletarCurso', () => {
    it('deve deletar um curso e retornar true', async () => {
      mockTypeOrmRepository.delete.mockResolvedValueOnce({ affected: 1 });

      const result = await repository.deletarCurso(cursoAtivo.id);

      expect(result).toBe(true);
      expect(mockTypeOrmRepository.delete).toHaveBeenCalledWith(cursoAtivo.id);
    });

    it('deve retornar false quando nenhum curso é deletado', async () => {
      mockTypeOrmRepository.delete.mockResolvedValueOnce({ affected: 0 });

      const result = await repository.deletarCurso('nao-existe');

      expect(result).toBe(false);
    });
  });

  describe('implementação da interface', () => {
    it('deve implementar ICursoRepository', () => {
      const implementa: ICursoRepository = repository;
      expect(implementa).toBeDefined();
    });
  });
});
