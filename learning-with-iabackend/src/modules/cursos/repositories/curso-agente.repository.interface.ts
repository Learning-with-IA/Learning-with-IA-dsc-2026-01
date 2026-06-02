import { CursoAgente } from '../entities/curso-agente.entity';

export interface ICursoAgenteRepository {
  /**
   * Obtém o agente de um curso pelo ID do curso
   * @param cursoId - ID do curso
   * @returns O agente ou null se não encontrado
   */
  obterAgentePorCurso(cursoId: string): Promise<CursoAgente | null>;

  /**
   * Cria e salva um novo agente
   * @param agente - Dados do novo agente
   * @returns O agente salvo com ID
   */
  salvarAgente(agente: Partial<CursoAgente>): Promise<CursoAgente>;

  /**
   * Atualiza um agente existente
   * @param cursoId - ID do curso
   * @param dados - Dados a atualizar
   * @returns O agente atualizado
   */
  atualizarAgente(cursoId: string, dados: Partial<CursoAgente>): Promise<CursoAgente>;

  /**
   * Deleta o agente de um curso
   * @param cursoId - ID do curso
   * @returns true se deletado, false se não encontrado
   */
  deletarAgente(cursoId: string): Promise<boolean>;
}
