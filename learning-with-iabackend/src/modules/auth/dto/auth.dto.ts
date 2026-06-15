import { IsEmail, IsString, IsNotEmpty, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignUpDto {
  @ApiProperty({ example: 'Maria Silva', description: 'Nome completo do usuário' })
  @IsString()
  @IsNotEmpty({ message: 'O nome não pode estar vazio.' })
  name: string;

  @ApiProperty({ example: 'maria@email.com', description: 'E-mail válido para login' })
  @IsEmail({}, { message: 'Por favor, forneça um e-mail válido.' })
  @IsNotEmpty({ message: 'O e-mail não pode estar vazio.' })
  email: string;

  @ApiProperty({ example: 'Senha@123', description: 'Senha com no mínimo 6 caracteres' })
  @IsString()
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres.' })
  @IsNotEmpty({ message: 'A senha não pode estar vazia.' })
  password: string;

  @ApiProperty({ example: '(11) 99999-0000', description: 'Telefone de contato', required: false })
  @IsString()
  @IsOptional()
  phone?: string;
}

export class LoginDto {
  @ApiProperty({ example: 'maria@email.com', description: 'E-mail cadastrado' })
  @IsEmail({}, { message: 'Por favor, forneça um e-mail válido.' })
  @IsNotEmpty({ message: 'O e-mail não pode estar vazio.' })
  email: string;

  @ApiProperty({ example: 'Senha@123', description: 'Senha do usuário' })
  @IsString()
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres.' })
  @IsNotEmpty({ message: 'A senha não pode estar vazia.' })
  password: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'maria@email.com', description: 'E-mail para recuperação de senha' })
  @IsEmail({}, { message: 'Por favor, forneça um e-mail válido.' })
  @IsNotEmpty({ message: 'O e-mail não pode estar vazio.' })
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: 'abc123def456', description: 'Token temporário recebido por e-mail' })
  @IsString()
  @IsNotEmpty({ message: 'O token é obrigatório.' })
  token: string;

  @ApiProperty({ example: 'NovaSenha@456', description: 'Nova senha com no mínimo 6 caracteres' })
  @IsString()
  @MinLength(6, { message: 'A nova senha deve ter no mínimo 6 caracteres.' })
  @IsNotEmpty({ message: 'A nova senha não pode estar vazia.' })
  newPassword: string;
}
