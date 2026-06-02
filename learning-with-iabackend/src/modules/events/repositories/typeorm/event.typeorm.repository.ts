import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from '../../entities/event.entity';
import { IEventRepository } from '../event.repository.interface';

@Injectable()
export class EventTypeOrmRepository implements IEventRepository {
  constructor(
    @InjectRepository(Event)
    private readonly repository: Repository<Event>,
  ) {}

  async salvar(event: Partial<Event>): Promise<Event> {
    const entity = this.repository.create(event);
    return this.repository.save(entity);
  }

  async buscarTodos(): Promise<Event[]> {
    return this.repository.find();
  }

  async buscarPorId(id: string): Promise<Event | null> {
    return this.repository.findOne({ where: { id } });
  }

  async remover(event: Event): Promise<void> {
    await this.repository.remove(event);
  }
}
