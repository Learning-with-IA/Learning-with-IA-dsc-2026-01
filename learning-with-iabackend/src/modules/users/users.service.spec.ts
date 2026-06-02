import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User, UserRole } from './entities/user.entity';
import { IUserRepository } from './repositories/user.repository.interface';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let mockUserRepository: jest.Mocked<IUserRepository>;

  const mockUser: User = {
    id: 'user-id-1',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'hashedpassword',
    phone: '12345678',
    role: UserRole.STUDENT,
    isActive: true,
    recoveryToken: null,
    recoveryTokenExpires: null,
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
      buscarComFiltros: jest.fn(),
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

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('deve cadastrar um novo usuário criptografando a senha', async () => {
      const dto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: UserRole.TEACHER,
      };

      (bcrypt.hash as jest.Mock).mockResolvedValueOnce('hashedpassword');
      mockUserRepository.salvar.mockResolvedValueOnce(mockUser);

      const result = await service.create(dto);
      expect(result).toEqual(mockUser);
      expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 10);
      expect(mockUserRepository.salvar).toHaveBeenCalledWith(
        expect.objectContaining({
          password: 'hashedpassword',
          role: UserRole.TEACHER,
        }),
      );
    });
  });

  describe('findPaginated', () => {
    it('deve retornar listagem de usuários paginada com total', async () => {
      const filtros = { page: 1, limit: 10, name: 'John' };
      mockUserRepository.buscarComFiltros.mockResolvedValueOnce({
        data: [mockUser],
        total: 1,
      });

      const result = await service.findPaginated(filtros);

      expect(result).toEqual({
        data: [mockUser],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          pages: 1,
        },
      });
      expect(mockUserRepository.buscarComFiltros).toHaveBeenCalledWith(filtros);
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
    it('deve atualizar um usuário existente ignorando email e password', async () => {
      const dto = {
        name: 'John Updated',
        email: 'attacker@example.com',
        password: 'attackpassword',
      };

      mockUserRepository.buscarPorId.mockResolvedValueOnce(mockUser);
      mockUserRepository.salvar.mockResolvedValueOnce({
        ...mockUser,
        name: 'John Updated',
      });

      const result = await service.update('user-id-1', dto);

      expect(result.name).toBe('John Updated');
      expect(mockUserRepository.salvar).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'John Updated',
          email: mockUser.email,       // e-mail original inalterado
          password: mockUser.password, // senha original inalterada
        }),
      );
    });
  });

  describe('updateStatus', () => {
    it('deve alternar o status de atividade (isActive) do usuário', async () => {
      mockUserRepository.buscarPorId.mockResolvedValueOnce(mockUser);
      mockUserRepository.salvar.mockResolvedValueOnce({
        ...mockUser,
        isActive: false,
      });

      const result = await service.updateStatus('user-id-1', false);

      expect(result.isActive).toBe(false);
      expect(mockUserRepository.salvar).toHaveBeenCalledWith(
        expect.objectContaining({
          isActive: false,
        }),
      );
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
