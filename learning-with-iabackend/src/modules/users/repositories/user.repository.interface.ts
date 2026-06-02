import { User } from '../entities/user.entity';

export interface IUserRepository {
  salvar(user: Partial<User>): Promise<User>;
  buscarTodos(): Promise<User[]>;
  buscarPorId(id: string): Promise<User | null>;
  buscarPorEmail(email: string): Promise<User | null>;
  remover(user: User): Promise<void>;
}
