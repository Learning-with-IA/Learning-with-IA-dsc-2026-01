import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Curso, CursoStatus } from '../../entities/curso.entity';
import { ICursoRepository } from '../curso.repository.interface';

@Injectable()
export class CursoTypeOrmRepository implements ICursoRepository {
  constructor(
    @InjectRepository(Curso)
    private readonly repository: Repository<Curso>,
  ) {}

  async listarCursosAtivos(): Promise<Curso[]> {
    return this.repository.find({
      where: {
        status: CursoStatus.ATIVO,
      },
    });
  }

  async obterCursoById(id: string): Promise<Curso | null> {
    return this.repository.findOne({ where: { id } });
  }

  async salvarCurso(curso: Partial<Curso>): Promise<Curso> {
    const entity = this.repository.create(curso);
    return this.repository.save(entity);
  }

  async deletarCurso(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
