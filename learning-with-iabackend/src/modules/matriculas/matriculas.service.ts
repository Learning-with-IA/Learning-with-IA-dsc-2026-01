import {
  Injectable,
  Inject,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Matricula } from './entities/matricula.entity';
import { CriarMatriculaDto } from './dto/matricula.dto';
import type { IMatriculaRepository } from './repositories/matricula.repository.interface';
import { Curso, CursoStatus } from '../cursos/entities/curso.entity';

@Injectable()
export class MatriculasService {
  constructor(
    @Inject('IMatriculaRepository')
    private readonly repository: IMatriculaRepository,
    @InjectRepository(Curso)
    private readonly cursoRepository: Repository<Curso>,
  ) {}

  async criar(dto: CriarMatriculaDto): Promise<Matricula> {
    const curso = await this.cursoRepository.findOne({ where: { id: dto.cursoId } });
    if (!curso) {
      throw new NotFoundException(`Curso com ID "${dto.cursoId}" não encontrado`);
    }
    if (curso.status !== CursoStatus.ATIVO) {
      throw new BadRequestException(
        'Curso indisponível para matrícula (RN03): apenas cursos ATIVOS aceitam novas inscrições.',
      );
    }

    const existente = await this.repository.buscarPorUsuarioECurso(dto.usuarioId, dto.cursoId);
    if (existente) {
      if (existente.ativa) {
        throw new ConflictException('Usuário já possui matrícula ativa para este curso');
      }
      existente.ativa = true;
      return this.repository.salvar(existente);
    }

    return this.repository.salvar({
      usuarioId: dto.usuarioId,
      cursoId: dto.cursoId,
      ativa: true,
    });
  }

  async verificarMatriculaAtiva(usuarioId: string, cursoId: string): Promise<boolean> {
    const matricula = await this.repository.buscarPorUsuarioECurso(usuarioId, cursoId);
    return !!matricula && matricula.ativa;
  }

  async listarPorUsuario(usuarioId: string): Promise<Matricula[]> {
    return this.repository.listarPorUsuario(usuarioId);
  }

  async atualizarStatus(id: string, ativa: boolean): Promise<Matricula> {
    const matricula = await this.repository.buscarPorId(id);
    if (!matricula) {
      throw new NotFoundException(`Matrícula com ID "${id}" não encontrada`);
    }

    matricula.ativa = ativa;
    return this.repository.salvar(matricula);
  }
}
