import { DataSource } from 'typeorm';
import { Curso, CursoStatus } from './entities/curso.entity';

describe('Curso Repository / Entity', () => {
  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = new DataSource({
      type: 'sqljs',
      location: ':memory:',
      autoSave: false,
      entities: [Curso],
      synchronize: true,
    });
    await dataSource.initialize();
  });

  afterAll(async () => {
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
    }
  });

  it('deve persistir e recuperar um curso válido', async () => {
    const repository = dataSource.getRepository(Curso);
    const curso = repository.create({
      nome: 'Curso de Teste',
      descricao: 'Descrição do curso de teste',
      cargaHoraria: 60,
      imagemUrl: 'https://example.com/teste.png',
      status: CursoStatus.ATIVO,
    });

    const saved = await repository.save(curso);
    expect(saved.id).toBeDefined();
    expect(saved.status).toBe(CursoStatus.ATIVO);

    const found = await repository.findOneBy({ id: saved.id });
    expect(found).toBeDefined();
    expect(found).toMatchObject({
      nome: 'Curso de Teste',
      descricao: 'Descrição do curso de teste',
      status: CursoStatus.ATIVO,
    });
  });

  it('deve lançar erro ao tentar salvar status fora do enum', async () => {
    const repository = dataSource.getRepository(Curso);
    const curso = repository.create({
      nome: 'Curso Inválido',
      descricao: 'Status não permitido',
      cargaHoraria: 10,
      imagemUrl: null,
      status: 'INVALIDO' as any,
    });

    await expect(repository.save(curso)).rejects.toThrow();
  });
});
