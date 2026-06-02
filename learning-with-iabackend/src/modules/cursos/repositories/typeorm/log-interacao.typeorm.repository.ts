import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LogInteracao } from '../../entities/log-interacao.entity';
import { ILogInteracaoRepository } from '../log-interacao.repository.interface';

@Injectable()
export class LogInteracaoTypeOrmRepository implements ILogInteracaoRepository {
  constructor(
    @InjectRepository(LogInteracao)
    private readonly repository: Repository<LogInteracao>,
  ) {}

  async salvarLog(log: Partial<LogInteracao>): Promise<LogInteracao> {
    const entity = this.repository.create(log);
    return this.repository.save(entity);
  }

  async obterHistorico(usuarioId: string, cursoId: string, limite: number = 50): Promise<LogInteracao[]> {
    return this.repository.find({
      where: { usuarioId, cursoId },
      order: { criadoEm: 'DESC' },
      take: limite,
    });
  }

  async obterLogById(id: string): Promise<LogInteracao | null> {
    return this.repository.findOne({ where: { id } });
  }

  async deletarHistorico(usuarioId: string, cursoId: string): Promise<number> {
    const result = await this.repository.delete({
      usuarioId,
      cursoId,
    });
    return result.affected || 0;
  }
}
