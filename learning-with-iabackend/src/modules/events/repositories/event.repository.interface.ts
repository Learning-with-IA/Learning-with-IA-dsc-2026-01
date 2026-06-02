import { Event } from '../entities/event.entity';

export interface IEventRepository {
  salvar(event: Partial<Event>): Promise<Event>;
  buscarTodos(): Promise<Event[]>;
  buscarPorId(id: string): Promise<Event | null>;
  remover(event: Event): Promise<void>;
}
