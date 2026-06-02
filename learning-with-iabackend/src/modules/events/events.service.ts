import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Event } from './entities/event.entity';
import { CreateEventDto, UpdateEventDto } from './dto/event.dto';
import type { IEventRepository } from './repositories/event.repository.interface';

@Injectable()
export class EventsService {
  constructor(
    @Inject('IEventRepository')
    private readonly eventsRepository: IEventRepository,
  ) {}

  // CREATE - POST /events
  async create(createEventDto: CreateEventDto): Promise<Event> {
    return this.eventsRepository.salvar(createEventDto);
  }

  // READ ALL - GET /events
  async findAll(): Promise<Event[]> {
    return this.eventsRepository.buscarTodos();
  }

  // READ BY ID - GET /events/:id
  async findOne(id: string): Promise<Event> {
    const event = await this.eventsRepository.buscarPorId(id);

    if (!event) {
      throw new NotFoundException(
        `Evento com ID "${id}" não foi encontrado.`,
      );
    }

    return event;
  }

  // UPDATE - PATCH /events/:id
  async update(
    id: string,
    updateEventDto: UpdateEventDto,
  ): Promise<Event> {
    const event = await this.findOne(id);
    Object.assign(event, updateEventDto);
    return this.eventsRepository.salvar(event);
  }

  // DELETE - DELETE /events/:id
  async remove(id: string): Promise<{ message: string }> {
    const event = await this.findOne(id);
    await this.eventsRepository.remover(event);
    return { message: `Evento com ID "${id}" removido com sucesso.` };
  }
}
