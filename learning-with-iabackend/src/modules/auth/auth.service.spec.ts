import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { User, UserRole } from '../users/entities/user.entity';
import { IUserRepository } from '../users/repositories/user.repository.interface';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let mockJwtService: jest.Mocked<JwtService>;

  const mockUser: User = {
    id: 'user-id-1',
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashedpassword',
    phone: '99999999',
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
    };

    mockJwtService = {
      sign: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: 'IUserRepository',
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signup', () => {
    const signupDto = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      phone: '99999999',
    };

    it('deve registrar um novo usuário com senha criptografada', async () => {
      mockUserRepository.buscarPorEmail.mockResolvedValueOnce(null);
      (bcrypt.hash as jest.Mock).mockResolvedValueOnce('hashedpassword');
      mockUserRepository.salvar.mockResolvedValueOnce(mockUser);

      const result = await service.signup(signupDto);

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.buscarPorEmail).toHaveBeenCalledWith(signupDto.email);
      expect(bcrypt.hash).toHaveBeenCalledWith(signupDto.password, 10);
      expect(mockUserRepository.salvar).toHaveBeenCalledWith({
        name: signupDto.name,
        email: signupDto.email,
        password: 'hashedpassword',
        phone: signupDto.phone,
        role: UserRole.STUDENT,
      });
    });

    it('deve lançar ConflictException se o e-mail já existir', async () => {
      mockUserRepository.buscarPorEmail.mockResolvedValueOnce(mockUser);

      await expect(service.signup(signupDto)).rejects.toThrow(ConflictException);
      expect(mockUserRepository.salvar).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('deve autenticar o usuário e retornar o token de acesso', async () => {
      mockUserRepository.buscarPorEmail.mockResolvedValueOnce(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
      mockJwtService.sign.mockReturnValueOnce('mocked-jwt-token');

      const result = await service.login(loginDto);

      expect(result).toEqual({ accessToken: 'mocked-jwt-token' });
      expect(mockUserRepository.buscarPorEmail).toHaveBeenCalledWith(loginDto.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.password);
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
    });

    it('deve lançar UnauthorizedException se o e-mail não for encontrado', async () => {
      mockUserRepository.buscarPorEmail.mockResolvedValueOnce(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('deve lançar UnauthorizedException se a senha estiver incorreta', async () => {
      mockUserRepository.buscarPorEmail.mockResolvedValueOnce(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout e sessao', () => {
    it('deve invalidar o token atual adicionando na blacklist', async () => {
      const token = 'some-jwt-token';
      expect(service.isTokenBlacklisted(token)).toBe(false);

      await service.logout(token);

      expect(service.isTokenBlacklisted(token)).toBe(true);
    });
  });

  describe('forgotPassword', () => {
    const forgotDto = { email: 'test@example.com' };

    it('deve gerar token de recuperação e salvar se o e-mail existir', async () => {
      mockUserRepository.buscarPorEmail.mockResolvedValueOnce(mockUser);
      mockUserRepository.salvar.mockResolvedValueOnce({
        ...mockUser,
        recoveryToken: 'some-token',
        recoveryTokenExpires: new Date(Date.now() + 15 * 60 * 1000),
      });

      await service.forgotPassword(forgotDto);

      expect(mockUserRepository.buscarPorEmail).toHaveBeenCalledWith(forgotDto.email);
      expect(mockUserRepository.salvar).toHaveBeenCalled();
    });

    it('não deve salvar nem falhar se o e-mail não existir (segurança)', async () => {
      mockUserRepository.buscarPorEmail.mockResolvedValueOnce(null);

      await service.forgotPassword(forgotDto);

      expect(mockUserRepository.buscarPorEmail).toHaveBeenCalledWith(forgotDto.email);
      expect(mockUserRepository.salvar).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    const resetDto = {
      token: 'valid-recovery-token',
      newPassword: 'newpassword123',
    };

    it('deve alterar a senha se o token for válido e não expirado', async () => {
      const expiringInFuture = new Date(Date.now() + 10 * 60 * 1000);
      const userWithToken = {
        ...mockUser,
        recoveryToken: 'valid-recovery-token',
        recoveryTokenExpires: expiringInFuture,
      };

      // Usar a busca customizada do repositório para o token, ou buscar todos e filtrar.
      // Como não temos buscarPorToken na interface IUserRepository, o Service buscará buscando por email ou no banco.
      // Espera, para buscar por token, como fazemos? 
      // Nós podemos buscar todos os usuários ou criar um método de busca por token, ou buscar todos e filtrar,
      // ou fazer buscar por email/id. Mas espera, na interface IUserRepository temos buscarTodos.
      // O serviço pode chamar buscarTodos e procurar o usuário com o token correspondente.
      mockUserRepository.buscarTodos.mockResolvedValueOnce([userWithToken]);
      (bcrypt.hash as jest.Mock).mockResolvedValueOnce('newhashedpassword');
      mockUserRepository.salvar.mockResolvedValueOnce({
        ...userWithToken,
        password: 'newhashedpassword',
        recoveryToken: null,
        recoveryTokenExpires: null,
      });

      await service.resetPassword(resetDto);

      expect(mockUserRepository.buscarTodos).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith(resetDto.newPassword, 10);
      expect(mockUserRepository.salvar).toHaveBeenCalledWith(expect.objectContaining({
        password: 'newhashedpassword',
        recoveryToken: null,
        recoveryTokenExpires: null,
      }));
    });

    it('deve lançar BadRequestException se o token não for encontrado', async () => {
      mockUserRepository.buscarTodos.mockResolvedValueOnce([mockUser]);

      await expect(service.resetPassword(resetDto)).rejects.toThrow(BadRequestException);
      expect(mockUserRepository.salvar).not.toHaveBeenCalled();
    });

    it('deve lançar BadRequestException se o token estiver expirado', async () => {
      const expiredInPast = new Date(Date.now() - 10 * 60 * 1000);
      const userWithExpiredToken = {
        ...mockUser,
        recoveryToken: 'valid-recovery-token',
        recoveryTokenExpires: expiredInPast,
      };
      mockUserRepository.buscarTodos.mockResolvedValueOnce([userWithExpiredToken]);

      await expect(service.resetPassword(resetDto)).rejects.toThrow(BadRequestException);
      expect(mockUserRepository.salvar).not.toHaveBeenCalled();
    });
  });
});
