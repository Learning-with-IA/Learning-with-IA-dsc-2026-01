import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MatriculaTypeOrmRepository } from './matricula.typeorm.repository';
import { Matricula } from '../../entities/matricula.entity';
import { IMatriculaRepository } from '../matricula.repository.interface';

describe('MatriculaTypeOrmRepository', () => {
  let repository: MatriculaTypeOrmRepository;
  let mockTypeOrmRepository: jest.Mocked<Repository<Matricula>>;

  const mockMatricula: Matricula = {
    id: 'matricula-id-1',
    usuarioId: 'user-id-1',
    cursoId: 'course-id-1',
    ativa: true,
    criadoEm: new Date(),
    atualizadoEm: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatriculaTypeOrmRepository,
        {
          provide: getRepositoryToken(Matricula),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    repository = module.get<MatriculaTypeOrmRepository>(MatriculaTypeOrmRepository);
    mockTypeOrmRepository = module.get<jest.Mocked<Repository<Matricula>>>(getRepositoryToken(Matricula));
  });

  it('deve salvar uma matrícula', async () => {
    mockTypeOrmRepository.create.mockReturnValueOnce(mockMatricula);
    mockTypeOrmRepository.save.mockResolvedValueOnce(mockMatricula);

    const result = await repository.salvar({ usuarioId: 'user-id-1', cursoId: 'course-id-1' });
    expect(result).toEqual(mockMatricula);
    expect(mockTypeOrmRepository.create).toHaveBeenCalledWith({ usuarioId: 'user-id-1', cursoId: 'course-id-1' });
    expect(mockTypeOrmRepository.save).toHaveBeenCalledWith(mockMatricula);
  });

  it('deve buscar por usuario e curso', async () => {
    mockTypeOrmRepository.findOne.mockResolvedValueOnce(mockMatricula);

    const result = await repository.buscarPorUsuarioECurso('user-id-1', 'course-id-1');
    expect(result).toEqual(mockMatricula);
    expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({ where: { usuarioId: 'user-id-1', cursoId: 'course-id-1' } });
  });

  it('deve listar por usuario', async () => {
    mockTypeOrmRepository.find.mockResolvedValueOnce([mockMatricula]);

    const result = await repository.listarPorUsuario('user-id-1');
    expect(result).toEqual([mockMatricula]);
    expect(mockTypeOrmRepository.find).toHaveBeenCalledWith({ where: { usuarioId: 'user-id-1' } });
  });

  it('deve buscar por id', async () => {
    mockTypeOrmRepository.findOne.mockResolvedValueOnce(mockMatricula);

    const result = await repository.buscarPorId('matricula-id-1');
    expect(result).toEqual(mockMatricula);
    expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({ where: { id: 'matricula-id-1' } });
  });

  it('deve implementar IMatriculaRepository', () => {
    const impl: IMatriculaRepository = repository;
    expect(impl).toBeDefined();
  });
});
