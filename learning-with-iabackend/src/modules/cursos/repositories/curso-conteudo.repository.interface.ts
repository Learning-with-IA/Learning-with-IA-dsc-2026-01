import { CursoConteudo } from '../entities/curso-conteudo.entity';

export interface ICursoConteudoRepository {
  /**
   * Cria e salva um novo conteúdo de curso
   * @param conteudo - Dados do novo conteúdo
   * @returns O conteúdo salvo com ID
   */
  salvarConteudo(conteudo: Partial<CursoConteudo>): Promise<CursoConteudo>;

  /**
   * Obtém um conteúdo pelo ID
   * @param id - ID do conteúdo
   * @returns O conteúdo ou null se não encontrado
   */
  obterConteudoById(id: string): Promise<CursoConteudo | null>;

  /**
   * Obtém um conteúdo pelo ID verificando se pertence ao curso
   * @param conteudoId - ID do conteúdo
   * @param cursoId - ID do curso
   * @returns O conteúdo ou null
   */
  obterConteudoByCurso(conteudoId: string, cursoId: string): Promise<CursoConteudo | null>;

  /**
   * Lista todos os conteúdos ativos de um curso, ordenados
   * @param cursoId - ID do curso
   * @returns Array de conteúdos
   */
  listarConteudoAtivoPorCurso(cursoId: string): Promise<CursoConteudo[]>;

  /**
   * Atualiza um conteúdo existente
   * @param conteudoId - ID do conteúdo a atualizar
   * @param dados - Dados a atualizar
   * @returns O conteúdo atualizado
   */
  atualizarConteudo(conteudoId: string, dados: Partial<CursoConteudo>): Promise<CursoConteudo>;

  /**
   * Deleta um conteúdo pelo ID e curso
   * @param conteudoId - ID do conteúdo
   * @param cursoId - ID do curso
   * @returns true se deletado, false se não encontrado
   */
  deletarConteudo(conteudoId: string, cursoId: string): Promise<boolean>;
}
