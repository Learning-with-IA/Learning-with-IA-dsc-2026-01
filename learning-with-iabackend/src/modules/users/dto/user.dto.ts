import { IsEmail, IsString, IsNotEmpty, MinLength, IsOptional, IsEnum, IsBoolean, IsNumber } from 'class-validator';
import { UserRole } from '../entities/user.entity';
import { Transform } from 'class-transformer';

export class CreateUserDto {
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

  @IsEnum(UserRole, { message: 'O papel/role informado é inválido.' })
  @IsOptional()
  role?: UserRole;
}

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail({}, { message: 'Por favor, forneça um e-mail válido.' })
  @IsOptional()
  email?: string;

  @IsString()
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres.' })
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEnum(UserRole, { message: 'O papel/role informado é inválido.' })
  @IsOptional()
  role?: UserRole;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class GetUsersFilterDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber({}, { message: 'A página deve ser um número.' })
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber({}, { message: 'O limite deve ser um número.' })
  limit?: number = 10;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsEnum(UserRole, { message: 'O papel/role informado é inválido.' })
  @IsOptional()
  role?: UserRole;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean({ message: 'O status de atividade deve ser booleano.' })
  isActive?: boolean;
}
