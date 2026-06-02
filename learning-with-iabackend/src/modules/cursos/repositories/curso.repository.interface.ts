import { Curso } from '../entities/curso.entity';

export interface ICursoRepository {
  /**
   * Lista todos os cursos com status ATIVO
   */
  listarCursosAtivos(): Promise<Curso[]>;

  /**
   * Obtém um curso pelo ID
   * @param id - ID do curso
   * @returns O curso ou null se não encontrado
   */
  obterCursoById(id: string): Promise<Curso | null>;

  /**
   * Salva um novo curso ou atualiza um existente
   * @param curso - Dados parciais do curso (id será gerado se novo)
   * @returns O curso salvo com ID
   */
  salvarCurso(curso: Partial<Curso>): Promise<Curso>;

  /**
   * Deleta um curso pelo ID
   * @param id - ID do curso
   * @returns true se deletado, false se não encontrado
   */
  deletarCurso(id: string): Promise<boolean>;
}
