import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CursoAgente } from '../../entities/curso-agente.entity';
import { ICursoAgenteRepository } from '../curso-agente.repository.interface';

@Injectable()
export class CursoAgenteTypeOrmRepository implements ICursoAgenteRepository {
  constructor(
    @InjectRepository(CursoAgente)
    private readonly repository: Repository<CursoAgente>,
  ) {}

  async obterAgentePorCurso(cursoId: string): Promise<CursoAgente | null> {
    return this.repository.findOne({ where: { cursoId } });
  }

  async salvarAgente(agente: Partial<CursoAgente>): Promise<CursoAgente> {
    const entity = this.repository.create(agente);
    return this.repository.save(entity);
  }

  async atualizarAgente(cursoId: string, dados: Partial<CursoAgente>): Promise<CursoAgente> {
    await this.repository.update({ cursoId }, dados);
    const agente = await this.repository.findOneBy({ cursoId });
    if (!agente) {
      throw new Error(`Agente do curso "${cursoId}" não encontrado após atualização`);
    }
    return agente;
  }

  async deletarAgente(cursoId: string): Promise<boolean> {
    const result = await this.repository.delete({ cursoId });
    return (result.affected ?? 0) > 0;
  }
}
