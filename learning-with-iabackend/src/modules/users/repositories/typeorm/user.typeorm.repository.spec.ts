import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserTypeOrmRepository } from './user.typeorm.repository';
import { User } from '../../entities/user.entity';
import { IUserRepository } from '../user.repository.interface';

describe('UserTypeOrmRepository', () => {
  let repository: UserTypeOrmRepository;
  let mockTypeOrmRepository: jest.Mocked<Repository<User>>;

  const mockUser: User = {
    id: 'user-id-1',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    phone: '12345678',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserTypeOrmRepository,
        {
          provide: getRepositoryToken(User),
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

    repository = module.get<UserTypeOrmRepository>(UserTypeOrmRepository);
    mockTypeOrmRepository = module.get<jest.Mocked<Repository<User>>>(getRepositoryToken(User));
  });

  it('deve salvar um usuário', async () => {
    mockTypeOrmRepository.create.mockReturnValueOnce(mockUser);
    mockTypeOrmRepository.save.mockResolvedValueOnce(mockUser);

    const result = await repository.salvar({ name: 'John Doe' });
    expect(result).toEqual(mockUser);
    expect(mockTypeOrmRepository.create).toHaveBeenCalledWith({ name: 'John Doe' });
    expect(mockTypeOrmRepository.save).toHaveBeenCalledWith(mockUser);
  });

  it('deve buscar todos os usuários', async () => {
    mockTypeOrmRepository.find.mockResolvedValueOnce([mockUser]);

    const result = await repository.buscarTodos();
    expect(result).toEqual([mockUser]);
    expect(mockTypeOrmRepository.find).toHaveBeenCalled();
  });

  it('deve buscar por id', async () => {
    mockTypeOrmRepository.findOne.mockResolvedValueOnce(mockUser);

    const result = await repository.buscarPorId('user-id-1');
    expect(result).toEqual(mockUser);
    expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({ where: { id: 'user-id-1' } });
  });

  it('deve buscar por email', async () => {
    mockTypeOrmRepository.findOne.mockResolvedValueOnce(mockUser);

    const result = await repository.buscarPorEmail('john@example.com');
    expect(result).toEqual(mockUser);
    expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({ where: { email: 'john@example.com' } });
  });

  it('deve remover um usuário', async () => {
    mockTypeOrmRepository.remove.mockResolvedValueOnce(mockUser);

    await repository.remover(mockUser);
    expect(mockTypeOrmRepository.remove).toHaveBeenCalledWith(mockUser);
  });

  it('deve implementar IUserRepository', () => {
    const impl: IUserRepository = repository;
    expect(impl).toBeDefined();
  });
});
