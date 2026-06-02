import { IsEmail, IsString, IsNotEmpty, MinLength, IsOptional } from 'class-validator';

export class SignUpDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome não pode estar vazio.' })
  name: string;

  @IsEmail({}, { message: 'Por favor, forneça um e-mail válido.' })
  @IsNotEmpty({ message: 'O e-mail não pode estar vazio.' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres.' })
  @IsNotEmpty({ message: 'A senha não pode estar vazia.' })
  password: string;

  @IsString()
  @IsOptional()
  phone?: string;
}

export class LoginDto {
  @IsEmail({}, { message: 'Por favor, forneça um e-mail válido.' })
  @IsNotEmpty({ message: 'O e-mail não pode estar vazio.' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'A senha não pode estar vazia.' })
  password: string;
}

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Por favor, forneça um e-mail válido.' })
  @IsNotEmpty({ message: 'O e-mail não pode estar vazio.' })
  email: string;
}

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'O token é obrigatório.' })
  token: string;

  @IsString()
  @MinLength(6, { message: 'A nova senha deve ter no mínimo 6 caracteres.' })
  @IsNotEmpty({ message: 'A nova senha não pode estar vazia.' })
  newPassword: string;
}
