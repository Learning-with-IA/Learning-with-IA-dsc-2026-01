import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TipoConteudo } from '../entities/curso-conteudo.entity';

export class CreateCursoConteudoDto {
  @ApiProperty({ example: 'Introdução à Programação', description: 'Título do conteúdo' })
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @ApiProperty({ example: 'Nesta aula você aprenderá os fundamentos básicos de programação...', description: 'Corpo do conteúdo' })
  @IsString()
  @IsNotEmpty()
  conteudo: string;

  @ApiProperty({ example: 'TEXTO', enum: TipoConteudo, description: 'Tipo do conteúdo', required: false })
  @IsEnum(TipoConteudo)
  @IsOptional()
  tipo?: TipoConteudo;

  @ApiProperty({ example: 1, description: 'Ordem de exibição do conteúdo', required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  ordem?: number;
}

export class UpdateCursoConteudoDto {
  @ApiProperty({ example: 'Título Atualizado', description: 'Novo título', required: false })
  @IsString()
  @IsOptional()
  titulo?: string;

  @ApiProperty({ example: 'Conteúdo atualizado com novas informações...', description: 'Novo conteúdo', required: false })
  @IsString()
  @IsOptional()
  conteudo?: string;

  @ApiProperty({ example: 'TEXTO', enum: TipoConteudo, description: 'Novo tipo', required: false })
  @IsEnum(TipoConteudo)
  @IsOptional()
  tipo?: TipoConteudo;

  @ApiProperty({ example: 2, description: 'Nova ordem de exibição', required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  ordem?: number;
}

export class CursoConteudoResponseDto {
  @ApiProperty({ example: '12345678-abcd-efgh-ijkl-123456789012' })
  id: string;

  @ApiProperty({ example: 'f0e1d2c3-b4a5-6789-0123-456789abcdef' })
  cursoId: string;

  @ApiProperty({ example: 'Introdução à Programação' })
  titulo: string;

  @ApiProperty({ example: 'TEXTO', enum: TipoConteudo })
  tipo: TipoConteudo;

  @ApiProperty({ example: 1 })
  ordem: number;

  @ApiProperty({ example: true })
  ativo: boolean;

  @ApiProperty({ example: '2026-06-15T12:00:00.000Z' })
  criadoEm: Date;
}
