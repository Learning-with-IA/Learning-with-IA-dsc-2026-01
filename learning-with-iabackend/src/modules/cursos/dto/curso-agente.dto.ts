import { IsString, IsOptional, IsEnum, IsNumber, Min, Max, IsUUID, IsNotEmpty } from 'class-validator';
import { ModeloIA } from '../entities/curso-agente.entity';

export class CreateCursoAgenteDto {
  @IsEnum(ModeloIA)
  @IsOptional()
  modeloIA?: ModeloIA;

  @IsString()
  @IsOptional()
  systemPrompt?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(1)
  temperatura?: number;

  @IsNumber()
  @IsOptional()
  @Min(100)
  @Max(4000)
  maxTokens?: number;
}

export class QueryAgenteDto {
  @IsString()
  pergunta: string;

  @IsUUID()
  @IsOptional()
  usuarioId?: string;
}

export class CursoAgenteResponseDto {
  id: string;
  cursoId: string;
  modeloIA: ModeloIA;
  temperatura: number;
  maxTokens: number;
  ativo: boolean;
  versao: number;
}

export class RespostaAgenteDto {
  id: string;
  pergunta: string;
  resposta: string;
  confianca: number;
  tempoResposta: number;
  fontes: string[];
}

export class ChatDto {
  @IsString()
  @IsNotEmpty()
  pergunta: string;

  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @IsUUID()
  cursoId: string;
}
