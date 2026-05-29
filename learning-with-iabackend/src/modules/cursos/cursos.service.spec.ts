import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CursosService } from './cursos.service';
import { Curso, CursoStatus } from './entities/curso.entity';

describe('CursosService', () => {
  let service: CursosService;
  let repository: Repository<Curso>;

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
        CursosService,
        {
          provide: getRepositoryToken(Curso),
          useValue: {
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CursosService>(CursosService);
    repository = module.get<Repository<Curso>>(getRepositoryToken(Curso));
  });

  it('deve retornar apenas cursos com status ATIVO', async () => {
    jest.spyOn(repository, 'find').mockResolvedValueOnce([cursoAtivo]);

    const result = await service.listarCursosAtivos();

    expect(repository.find).toHaveBeenCalledWith({
      where: { status: CursoStatus.ATIVO },
    });
    expect(result).toEqual([cursoAtivo]);
  });

  it('deve retornar array vazio quando não há cursos cadastrados', async () => {
    jest.spyOn(repository, 'find').mockResolvedValueOnce([]);

    const result = await service.listarCursosAtivos();

    expect(result).toEqual([]);
  });
});
