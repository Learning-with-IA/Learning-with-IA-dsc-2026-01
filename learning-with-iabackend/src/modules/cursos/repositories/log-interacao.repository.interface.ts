import { LogInteracao } from '../entities/log-interacao.entity';

export interface ILogInteracaoRepository {
  /**
   * Registra uma nova interação
   * @param log - Dados da interação
   * @returns O log salvo com ID
   */
  salvarLog(log: Partial<LogInteracao>): Promise<LogInteracao>;

  /**
   * Obtém o histórico de interações de um usuário em um curso
   * @param usuarioId - ID do usuário
   * @param cursoId - ID do curso
   * @param limite - Número máximo de registros (padrão 50)
   * @returns Array de logs ordenados por data descrescente
   */
  obterHistorico(usuarioId: string, cursoId: string, limite?: number): Promise<LogInteracao[]>;

  /**
   * Obtém um log específico pelo ID
   * @param id - ID do log
   * @returns O log ou null se não encontrado
   */
  obterLogById(id: string): Promise<LogInteracao | null>;

  /**
   * Deleta todos os logs de um usuário em um curso
   * @param usuarioId - ID do usuário
   * @param cursoId - ID do curso
   * @returns Número de logs deletados
   */
  deletarHistorico(usuarioId: string, cursoId: string): Promise<number>;
}
