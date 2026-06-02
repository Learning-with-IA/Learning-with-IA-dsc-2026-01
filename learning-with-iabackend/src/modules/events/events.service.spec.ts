import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EventsService } from './events.service';
import { Event } from './entities/event.entity';
import { IEventRepository } from './repositories/event.repository.interface';

describe('EventsService', () => {
  let service: EventsService;
  let mockEventRepository: jest.Mocked<IEventRepository>;

  const mockEvent: Event = {
    id: 'event-id-1',
    title: 'Webinar AI',
    description: 'AI in Education',
    eventDate: new Date(),
    location: 'Online',
    capacity: 100,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    mockEventRepository = {
      salvar: jest.fn(),
      buscarTodos: jest.fn(),
      buscarPorId: jest.fn(),
      remover: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: 'IEventRepository',
          useValue: mockEventRepository,
        },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
  });

  describe('create', () => {
    it('deve criar um novo evento', async () => {
      const dto = { title: 'Webinar AI', eventDate: new Date() };
      mockEventRepository.salvar.mockResolvedValueOnce(mockEvent);

      const result = await service.create(dto);
      expect(result).toEqual(mockEvent);
      expect(mockEventRepository.salvar).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('deve retornar todos os eventos', async () => {
      mockEventRepository.buscarTodos.mockResolvedValueOnce([mockEvent]);

      const result = await service.findAll();
      expect(result).toEqual([mockEvent]);
      expect(mockEventRepository.buscarTodos).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('deve retornar um evento por ID', async () => {
      mockEventRepository.buscarPorId.mockResolvedValueOnce(mockEvent);

      const result = await service.findOne('event-id-1');
      expect(result).toEqual(mockEvent);
      expect(mockEventRepository.buscarPorId).toHaveBeenCalledWith('event-id-1');
    });

    it('deve lançar NotFoundException se o evento não for encontrado', async () => {
      mockEventRepository.buscarPorId.mockResolvedValueOnce(null);

      await expect(service.findOne('invalido')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('deve atualizar um evento existente', async () => {
      const dto = { title: 'Updated Title' };
      mockEventRepository.buscarPorId.mockResolvedValueOnce(mockEvent);
      mockEventRepository.salvar.mockResolvedValueOnce({ ...mockEvent, title: 'Updated Title' });

      const result = await service.update('event-id-1', dto);
      expect(result.title).toBe('Updated Title');
      expect(mockEventRepository.salvar).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('deve remover um evento', async () => {
      mockEventRepository.buscarPorId.mockResolvedValueOnce(mockEvent);
      mockEventRepository.remover.mockResolvedValueOnce();

      const result = await service.remove('event-id-1');
      expect(result).toEqual({ message: `Evento com ID "event-id-1" removido com sucesso.` });
      expect(mockEventRepository.remover).toHaveBeenCalledWith(mockEvent);
    });
  });
});
