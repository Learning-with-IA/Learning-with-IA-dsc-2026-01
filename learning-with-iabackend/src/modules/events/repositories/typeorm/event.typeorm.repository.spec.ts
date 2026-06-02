import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventTypeOrmRepository } from './event.typeorm.repository';
import { Event } from '../../entities/event.entity';
import { IEventRepository } from '../event.repository.interface';

describe('EventTypeOrmRepository', () => {
  let repository: EventTypeOrmRepository;
  let mockTypeOrmRepository: jest.Mocked<Repository<Event>>;

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
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventTypeOrmRepository,
        {
          provide: getRepositoryToken(Event),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    repository = module.get<EventTypeOrmRepository>(EventTypeOrmRepository);
    mockTypeOrmRepository = module.get<jest.Mocked<Repository<Event>>>(getRepositoryToken(Event));
  });

  it('deve salvar um evento', async () => {
    mockTypeOrmRepository.create.mockReturnValueOnce(mockEvent);
    mockTypeOrmRepository.save.mockResolvedValueOnce(mockEvent);

    const result = await repository.salvar({ title: 'Webinar AI' });
    expect(result).toEqual(mockEvent);
    expect(mockTypeOrmRepository.create).toHaveBeenCalledWith({ title: 'Webinar AI' });
    expect(mockTypeOrmRepository.save).toHaveBeenCalledWith(mockEvent);
  });

  it('deve buscar todos os eventos', async () => {
    mockTypeOrmRepository.find.mockResolvedValueOnce([mockEvent]);

    const result = await repository.buscarTodos();
    expect(result).toEqual([mockEvent]);
    expect(mockTypeOrmRepository.find).toHaveBeenCalled();
  });

  it('deve buscar por id', async () => {
    mockTypeOrmRepository.findOne.mockResolvedValueOnce(mockEvent);

    const result = await repository.buscarPorId('event-id-1');
    expect(result).toEqual(mockEvent);
    expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({ where: { id: 'event-id-1' } });
  });

  it('deve remover um evento', async () => {
    mockTypeOrmRepository.remove.mockResolvedValueOnce(mockEvent);

    await repository.remover(mockEvent);
    expect(mockTypeOrmRepository.remove).toHaveBeenCalledWith(mockEvent);
  });

  it('deve implementar IEventRepository', () => {
    const impl: IEventRepository = repository;
    expect(impl).toBeDefined();
  });
});
