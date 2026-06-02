import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { IUserRepository } from './repositories/user.repository.interface';

describe('UsersService', () => {
  let service: UsersService;
  let mockUserRepository: jest.Mocked<IUserRepository>;

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
    mockUserRepository = {
      salvar: jest.fn(),
      buscarTodos: jest.fn(),
      buscarPorId: jest.fn(),
      buscarPorEmail: jest.fn(),
      remover: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: 'IUserRepository',
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('create', () => {
    it('deve cadastrar um novo usuário', async () => {
      const dto = { name: 'John Doe', email: 'john@example.com', password: 'password123' };
      mockUserRepository.salvar.mockResolvedValueOnce(mockUser);

      const result = await service.create(dto);
      expect(result).toEqual(mockUser);
      expect(mockUserRepository.salvar).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('deve retornar todos os usuários', async () => {
      mockUserRepository.buscarTodos.mockResolvedValueOnce([mockUser]);

      const result = await service.findAll();
      expect(result).toEqual([mockUser]);
      expect(mockUserRepository.buscarTodos).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('deve retornar um usuário por ID', async () => {
      mockUserRepository.buscarPorId.mockResolvedValueOnce(mockUser);

      const result = await service.findOne('user-id-1');
      expect(result).toEqual(mockUser);
      expect(mockUserRepository.buscarPorId).toHaveBeenCalledWith('user-id-1');
    });

    it('deve lançar NotFoundException se o usuário não for encontrado', async () => {
      mockUserRepository.buscarPorId.mockResolvedValueOnce(null);

      await expect(service.findOne('invalido')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('deve atualizar um usuário existente', async () => {
      const dto = { name: 'John Updated' };
      mockUserRepository.buscarPorId.mockResolvedValueOnce(mockUser);
      mockUserRepository.salvar.mockResolvedValueOnce({ ...mockUser, name: 'John Updated' });

      const result = await service.update('user-id-1', dto);
      expect(result.name).toBe('John Updated');
      expect(mockUserRepository.salvar).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('deve remover um usuário', async () => {
      mockUserRepository.buscarPorId.mockResolvedValueOnce(mockUser);
      mockUserRepository.remover.mockResolvedValueOnce();

      const result = await service.remove('user-id-1');
      expect(result).toEqual({ message: `Usuário com ID "user-id-1" removido com sucesso.` });
      expect(mockUserRepository.remover).toHaveBeenCalledWith(mockUser);
    });
  });
});
