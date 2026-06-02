import { User } from '../entities/user.entity';
import { GetUsersFilterDto } from '../dto/user.dto';

export interface IUserRepository {
  salvar(user: Partial<User>): Promise<User>;
  buscarTodos(): Promise<User[]>;
  buscarPorId(id: string): Promise<User | null>;
  buscarPorEmail(email: string): Promise<User | null>;
  remover(user: User): Promise<void>;
  buscarComFiltros(
    filtros: GetUsersFilterDto,
  ): Promise<{ data: User[]; total: number }>;
}
