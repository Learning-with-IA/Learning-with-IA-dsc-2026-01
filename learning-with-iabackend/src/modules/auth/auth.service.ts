import { Injectable, Inject, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SignUpDto, LoginDto, ForgotPasswordDto, ResetPasswordDto } from './dto/auth.dto';
import { User, UserRole } from '../users/entities/user.entity';
import type { IUserRepository } from '../users/repositories/user.repository.interface';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  private readonly tokenBlacklist = new Set<string>();

  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async signup(signUpDto: SignUpDto): Promise<User> {
    const existingUser = await this.userRepository.buscarPorEmail(signUpDto.email);
    if (existingUser) {
      throw new ConflictException('E-mail já cadastrado no sistema.');
    }

    const hashedPassword = await bcrypt.hash(signUpDto.password, 10);

    const newUser = {
      name: signUpDto.name,
      email: signUpDto.email,
      password: hashedPassword,
      phone: signUpDto.phone,
      role: UserRole.STUDENT,
    };

    return this.userRepository.salvar(newUser);
  }

  async login(loginDto: LoginDto): Promise<{ accessToken: string }> {
    const user = await this.userRepository.buscarPorEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);
    return { accessToken };
  }

  async logout(token: string): Promise<void> {
    if (token) {
      this.tokenBlacklist.add(token);
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<void> {
    const user = await this.userRepository.buscarPorEmail(forgotPasswordDto.email);
    if (!user) {
      // Por segurança, não confirmamos se o e-mail existe
      return;
    }

    const token = crypto.randomBytes(20).toString('hex');
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 15); // Expiração em 15 minutos

    user.recoveryToken = token;
    user.recoveryTokenExpires = expires;

    await this.userRepository.salvar(user);
    // Nota: O envio real do e-mail seria integrado aqui
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    const users = await this.userRepository.buscarTodos();
    const user = users.find(
      (u) =>
        u.recoveryToken === resetPasswordDto.token &&
        u.recoveryTokenExpires &&
        u.recoveryTokenExpires.getTime() > Date.now(),
    );

    if (!user) {
      throw new BadRequestException('Token de recuperação inválido ou expirado.');
    }

    const hashedPassword = await bcrypt.hash(resetPasswordDto.newPassword, 10);
    user.password = hashedPassword;
    user.recoveryToken = null;
    user.recoveryTokenExpires = null;

    await this.userRepository.salvar(user);
  }

  isTokenBlacklisted(token: string): boolean {
    return this.tokenBlacklist.has(token);
  }
}
