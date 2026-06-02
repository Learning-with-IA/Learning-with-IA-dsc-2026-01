import { Matricula } from '../entities/matricula.entity';

export interface IMatriculaRepository {
  salvar(matricula: Partial<Matricula>): Promise<Matricula>;
  buscarPorUsuarioECurso(usuarioId: string, cursoId: string): Promise<Matricula | null>;
  listarPorUsuario(usuarioId: string): Promise<Matricula[]>;
  buscarPorId(id: string): Promise<Matricula | null>;
}
