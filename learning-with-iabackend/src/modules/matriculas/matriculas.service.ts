import { Injectable, Inject, ConflictException, NotFoundException } from '@nestjs/common';
import { Matricula } from './entities/matricula.entity';
import { CriarMatriculaDto } from './dto/matricula.dto';
import type { IMatriculaRepository } from './repositories/matricula.repository.interface';

@Injectable()
export class MatriculasService {
  constructor(
    @Inject('IMatriculaRepository')
    private readonly repository: IMatriculaRepository,
  ) {}

  async criar(dto: CriarMatriculaDto): Promise<Matricula> {
    const existente = await this.repository.buscarPorUsuarioECurso(dto.usuarioId, dto.cursoId);
    if (existente) {
      if (existente.ativa) {
        throw new ConflictException('Usuário já possui matrícula ativa para este curso');
      }
      // Reativa matrícula se estava inativa
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
