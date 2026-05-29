import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Curso, CursoStatus } from './entities/curso.entity';

@Injectable()
export class CursosService {
  constructor(
    @InjectRepository(Curso)
    private readonly cursosRepository: Repository<Curso>,
  ) {}

  async listarCursosAtivos(): Promise<Curso[]> {
    return this.cursosRepository.find({
      where: {
        status: CursoStatus.ATIVO,
      },
    });
  }
}
