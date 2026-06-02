import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { MatriculasService } from './matriculas.service';
import { Matricula } from './entities/matricula.entity';
import { IMatriculaRepository } from './repositories/matricula.repository.interface';

describe('MatriculasService', () => {
  let service: MatriculasService;
  let mockMatriculaRepository: jest.Mocked<IMatriculaRepository>;

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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatriculasService,
        {
          provide: 'IMatriculaRepository',
          useValue: mockMatriculaRepository,
        },
      ],
    }).compile();

    service = module.get<MatriculasService>(MatriculasService);
  });

  describe('criar', () => {
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
