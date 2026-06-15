import { IsEmail, IsString, IsNotEmpty, MinLength, IsOptional, IsEnum, IsBoolean, IsNumber } from 'class-validator';
import { UserRole } from '../entities/user.entity';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'João Silva', description: 'Nome completo do usuário' })
  @IsString()
  @IsNotEmpty({ message: 'O nome não pode estar vazio.' })
  name: string;

  @ApiProperty({ example: 'joao@email.com', description: 'E-mail válido e único' })
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

  @ApiProperty({ example: UserRole.STUDENT, enum: UserRole, description: 'Perfil do usuário', required: false })
  @IsEnum(UserRole, { message: 'O papel/role informado é inválido.' })
  @IsOptional()
  role?: UserRole;
}

export class UpdateUserDto {
  @ApiProperty({ example: 'João Atualizado', description: 'Novo nome', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'novo@email.com', description: 'Novo e-mail', required: false })
  @IsEmail({}, { message: 'Por favor, forneça um e-mail válido.' })
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'NovaSenha@456', description: 'Nova senha', required: false })
  @IsString()
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres.' })
  @IsOptional()
  password?: string;

  @ApiProperty({ example: '(21) 88888-1111', description: 'Novo telefone', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: UserRole.STUDENT, enum: UserRole, description: 'Novo perfil', required: false })
  @IsEnum(UserRole, { message: 'O papel/role informado é inválido.' })
  @IsOptional()
  role?: UserRole;

  @ApiProperty({ example: true, description: 'Status de atividade do usuário', required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class GetUsersFilterDto {
  @ApiProperty({ example: 1, description: 'Número da página', required: false })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber({}, { message: 'A página deve ser um número.' })
  page?: number = 1;

  @ApiProperty({ example: 10, description: 'Quantidade de itens por página', required: false })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber({}, { message: 'O limite deve ser um número.' })
  limit?: number = 10;

  @ApiProperty({ example: 'João', description: 'Filtrar por nome', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'joao@email.com', description: 'Filtrar por e-mail', required: false })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: UserRole.STUDENT, enum: UserRole, description: 'Filtrar por perfil', required: false })
  @IsEnum(UserRole, { message: 'O papel/role informado é inválido.' })
  @IsOptional()
  role?: UserRole;

  @ApiProperty({ example: true, description: 'Filtrar por status ativo/inativo', required: false })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean({ message: 'O status de atividade deve ser booleano.' })
  isActive?: boolean;
}
