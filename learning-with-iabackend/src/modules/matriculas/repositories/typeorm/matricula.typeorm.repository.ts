import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Matricula } from '../../entities/matricula.entity';
import { IMatriculaRepository } from '../matricula.repository.interface';

@Injectable()
export class MatriculaTypeOrmRepository implements IMatriculaRepository {
  constructor(
    @InjectRepository(Matricula)
    private readonly repository: Repository<Matricula>,
  ) {}

  async salvar(matricula: Partial<Matricula>): Promise<Matricula> {
    const entity = this.repository.create(matricula);
    return this.repository.save(entity);
  }

  async buscarPorUsuarioECurso(usuarioId: string, cursoId: string): Promise<Matricula | null> {
    return this.repository.findOne({ where: { usuarioId, cursoId } });
  }

  async listarPorUsuario(usuarioId: string): Promise<Matricula[]> {
    return this.repository.find({ where: { usuarioId } });
  }

  async buscarPorId(id: string): Promise<Matricula | null> {
    return this.repository.findOne({ where: { id } });
  }
}
