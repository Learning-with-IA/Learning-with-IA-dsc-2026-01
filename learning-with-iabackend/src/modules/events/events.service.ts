import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { CreateEventDto, UpdateEventDto } from './dto/event.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,
  ) {}

  // CREATE - POST /events
  async create(createEventDto: CreateEventDto): Promise<Event> {
    const event = this.eventsRepository.create(createEventDto);
    return await this.eventsRepository.save(event);
  }

  // READ ALL - GET /events
  async findAll(): Promise<Event[]> {
    return await this.eventsRepository.find();
  }

  // READ BY ID - GET /events/:id
  // 🎯 ENDPOINT PRINCIPAL: Busca um evento específico
  // ✅ Usa repository.findOne() com where clause
  // ✅ Lança NotFoundException se não encontrado (HTTP 404)
  async findOne(id: string): Promise<Event> {
    const event = await this.eventsRepository.findOne({
      where: { id },
    });

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
    return await this.eventsRepository.save(event);
  }

  // DELETE - DELETE /events/:id
  async remove(id: string): Promise<{ message: string }> {
    const event = await this.findOne(id);
    await this.eventsRepository.remove(event);
    return { message: `Evento com ID "${id}" removido com sucesso.` };
  }
}
