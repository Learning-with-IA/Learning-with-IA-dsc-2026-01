import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MatriculasService } from './matriculas.service';
import { Matricula } from './entities/matricula.entity';
import { IMatriculaRepository } from './repositories/matricula.repository.interface';
import { Curso, CursoStatus } from '../cursos/entities/curso.entity';

describe('MatriculasService', () => {
  let service: MatriculasService;
  let mockMatriculaRepository: jest.Mocked<IMatriculaRepository>;
  let mockCursoRepository: jest.Mocked<Pick<Repository<Curso>, 'findOne'>>;

  const cursoAtivo: Curso = {
    id: 'course-id-1',
    nome: 'Curso de Teste',
    descricao: 'Descrição',
    cargaHoraria: 40,
    imagemUrl: null,
    status: CursoStatus.ATIVO,
    criadoEm: new Date(),
    atualizadoEm: new Date(),
  } as Curso;

  const mockMatricula: Matricula = {
    id: 'matricula-id-1',
    usuarioId: 'user-id-1',
    cursoId: 'course-id-1',
    ativa: true,
    criadoEm: new Date(),
    atualizadoEm: new Date(),
  };

  beforeEach(async () => {
    mockMatriculaRepository = {
      salvar: jest.fn(),
      buscarPorUsuarioECurso: jest.fn(),
      listarPorUsuario: jest.fn(),
      buscarPorId: jest.fn(),
    };

    mockCursoRepository = {
      findOne: jest.fn().mockResolvedValue(cursoAtivo),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatriculasService,
        {
          provide: 'IMatriculaRepository',
          useValue: mockMatriculaRepository,
        },
        {
          provide: getRepositoryToken(Curso),
          useValue: mockCursoRepository,
        },
      ],
    }).compile();

    service = module.get<MatriculasService>(MatriculasService);
  });

  describe('criar — RN03 (validação do curso)', () => {
    const dto = { usuarioId: 'user-id-1', cursoId: 'course-id-1' };

    it('deve lançar NotFoundException se o curso não existir', async () => {
      mockCursoRepository.findOne.mockResolvedValueOnce(null);

      await expect(service.criar(dto)).rejects.toThrow(NotFoundException);
      expect(mockMatriculaRepository.salvar).not.toHaveBeenCalled();
    });

    it('deve lançar BadRequestException quando o curso estiver INATIVO (RN03)', async () => {
      mockCursoRepository.findOne.mockResolvedValueOnce({
        ...cursoAtivo,
        status: CursoStatus.INATIVO,
      } as Curso);

      await expect(service.criar(dto)).rejects.toThrow(BadRequestException);
      expect(mockMatriculaRepository.salvar).not.toHaveBeenCalled();
    });

    it('deve consultar o curso pelo id antes de prosseguir', async () => {
      mockMatriculaRepository.buscarPorUsuarioECurso.mockResolvedValueOnce(null);
      mockMatriculaRepository.salvar.mockResolvedValueOnce(mockMatricula);

      await service.criar(dto);

      expect(mockCursoRepository.findOne).toHaveBeenCalledWith({
        where: { id: dto.cursoId },
      });
    });
  });

  describe('criar — fluxo de persistência', () => {
    it('deve criar uma matrícula se não existir', async () => {
      const dto = { usuarioId: 'user-id-1', cursoId: 'course-id-1' };
      mockMatriculaRepository.buscarPorUsuarioECurso.mockResolvedValueOnce(null);
      mockMatriculaRepository.salvar.mockResolvedValueOnce(mockMatricula);

      const result = await service.criar(dto);
      expect(result).toEqual(mockMatricula);
      expect(mockMatriculaRepository.salvar).toHaveBeenCalledWith({
        usuarioId: dto.usuarioId,
        cursoId: dto.cursoId,
        ativa: true,
      });
    });

    it('deve lançar ConflictException se já existir matrícula ativa', async () => {
      const dto = { usuarioId: 'user-id-1', cursoId: 'course-id-1' };
      mockMatriculaRepository.buscarPorUsuarioECurso.mockResolvedValueOnce(mockMatricula);

      await expect(service.criar(dto)).rejects.toThrow(ConflictException);
    });

    it('deve reativar a matrícula se ela existir mas inativa', async () => {
      const dto = { usuarioId: 'user-id-1', cursoId: 'course-id-1' };
      const inativa = { ...mockMatricula, ativa: false };
      mockMatriculaRepository.buscarPorUsuarioECurso.mockResolvedValueOnce(inativa);
      mockMatriculaRepository.salvar.mockResolvedValueOnce(mockMatricula);

      const result = await service.criar(dto);
      expect(result.ativa).toBe(true);
      expect(mockMatriculaRepository.salvar).toHaveBeenCalledWith({ ...inativa, ativa: true });
    });
  });

  describe('verificarMatriculaAtiva', () => {
    it('deve retornar true se a matrícula está ativa', async () => {
      mockMatriculaRepository.buscarPorUsuarioECurso.mockResolvedValueOnce(mockMatricula);

      const result = await service.verificarMatriculaAtiva('user-id-1', 'course-id-1');
      expect(result).toBe(true);
    });

    it('deve retornar false se a matrícula não existe', async () => {
      mockMatriculaRepository.buscarPorUsuarioECurso.mockResolvedValueOnce(null);

      const result = await service.verificarMatriculaAtiva('user-id-1', 'course-id-1');
      expect(result).toBe(false);
    });
  });

  describe('listarPorUsuario', () => {
    it('deve listar as matrículas de um usuário', async () => {
      mockMatriculaRepository.listarPorUsuario.mockResolvedValueOnce([mockMatricula]);

      const result = await service.listarPorUsuario('user-id-1');
      expect(result).toEqual([mockMatricula]);
      expect(mockMatriculaRepository.listarPorUsuario).toHaveBeenCalledWith('user-id-1');
    });
  });

  describe('atualizarStatus', () => {
    it('deve atualizar o status da matrícula', async () => {
      mockMatriculaRepository.buscarPorId.mockResolvedValueOnce(mockMatricula);
      mockMatriculaRepository.salvar.mockResolvedValueOnce({ ...mockMatricula, ativa: false });

      const result = await service.atualizarStatus('matricula-id-1', false);
      expect(result.ativa).toBe(false);
      expect(mockMatriculaRepository.salvar).toHaveBeenCalled();
    });

    it('deve lançar NotFoundException se a matrícula não for encontrada', async () => {
      mockMatriculaRepository.buscarPorId.mockResolvedValueOnce(null);

      await expect(service.atualizarStatus('invalido', false)).rejects.toThrow(NotFoundException);
    });
  });
});
