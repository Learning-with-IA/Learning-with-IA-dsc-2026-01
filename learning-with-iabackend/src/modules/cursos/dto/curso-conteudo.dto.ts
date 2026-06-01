import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { TipoConteudo } from '../entities/curso-conteudo.entity';

export class CreateCursoConteudoDto {
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @IsString()
  @IsNotEmpty()
  conteudo: string;

  @IsEnum(TipoConteudo)
  @IsOptional()
  tipo?: TipoConteudo;

  @IsNumber()
  @IsOptional()
  @Min(0)
  ordem?: number;
}

export class UpdateCursoConteudoDto {
  @IsString()
  @IsOptional()
  titulo?: string;

  @IsString()
  @IsOptional()
  conteudo?: string;

  @IsEnum(TipoConteudo)
  @IsOptional()
  tipo?: TipoConteudo;

  @IsNumber()
  @IsOptional()
  @Min(0)
  ordem?: number;
}

export class CursoConteudoResponseDto {
  id: string;
  cursoId: string;
  titulo: string;
  tipo: TipoConteudo;
  ordem: number;
  ativo: boolean;
  criadoEm: Date;
}
