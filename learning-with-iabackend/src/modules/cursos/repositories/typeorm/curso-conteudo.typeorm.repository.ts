import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CursoConteudo } from '../../entities/curso-conteudo.entity';
import { ICursoConteudoRepository } from '../curso-conteudo.repository.interface';

@Injectable()
export class CursoConteudoTypeOrmRepository implements ICursoConteudoRepository {
  constructor(
    @InjectRepository(CursoConteudo)
    private readonly repository: Repository<CursoConteudo>,
  ) {}

  async salvarConteudo(conteudo: Partial<CursoConteudo>): Promise<CursoConteudo> {
    const entity = this.repository.create(conteudo);
    return this.repository.save(entity);
  }

  async obterConteudoById(id: string): Promise<CursoConteudo | null> {
    return this.repository.findOne({ where: { id } });
  }

  async obterConteudoByCurso(conteudoId: string, cursoId: string): Promise<CursoConteudo | null> {
    return this.repository.findOne({
      where: { id: conteudoId, cursoId },
    });
  }

  async listarConteudoAtivoPorCurso(cursoId: string): Promise<CursoConteudo[]> {
    return this.repository.find({
      where: { cursoId, ativo: true },
      order: { ordem: 'ASC' },
    });
  }

  async atualizarConteudo(conteudoId: string, dados: Partial<CursoConteudo>): Promise<CursoConteudo> {
    await this.repository.update(conteudoId, dados);
    const conteudo = await this.repository.findOneBy({ id: conteudoId });
    if (!conteudo) {
      throw new Error(`Conteúdo "${conteudoId}" não encontrado após atualização`);
    }
    return conteudo;
  }

  async deletarConteudo(conteudoId: string, cursoId: string): Promise<boolean> {
    const result = await this.repository.delete({
      id: conteudoId,
      cursoId,
    });
    return (result.affected ?? 0) > 0;
  }
}
