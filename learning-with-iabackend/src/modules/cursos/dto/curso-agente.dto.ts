import { IsString, IsOptional, IsEnum, IsNumber, Min, Max, IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ModeloIA } from '../entities/curso-agente.entity';

export class CreateCursoAgenteDto {
  @ApiProperty({ example: ModeloIA.GPT_3_5, enum: ModeloIA, description: 'Modelo de IA a ser utilizado', required: false })
  @IsEnum(ModeloIA)
  @IsOptional()
  modeloIA?: ModeloIA;

  @ApiProperty({ example: 'Você é um assistente especializado neste curso.', description: 'Prompt do sistema para definir comportamento do agente', required: false })
  @IsString()
  @IsOptional()
  systemPrompt?: string;

  @ApiProperty({ example: 0.7, description: 'Temperatura da resposta (0 = preciso, 1 = criativo)', required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(1)
  temperatura?: number;

  @ApiProperty({ example: 2000, description: 'Limite máximo de tokens por resposta', required: false })
  @IsNumber()
  @IsOptional()
  @Min(100)
  @Max(4000)
  maxTokens?: number;
}

export class QueryAgenteDto {
  @ApiProperty({ example: 'O que é programação orientada a objetos?', description: 'Pergunta para o agente de IA' })
  @IsString()
  pergunta: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', description: 'ID do usuário (opcional)', required: false })
  @IsUUID()
  @IsOptional()
  usuarioId?: string;
}

export class CursoAgenteResponseDto {
  @ApiProperty({ example: '12345678-abcd-efgh-ijkl-123456789012' })
  id: string;

  @ApiProperty({ example: 'f0e1d2c3-b4a5-6789-0123-456789abcdef' })
  cursoId: string;

  @ApiProperty({ example: ModeloIA.GPT_3_5, enum: ModeloIA })
  modeloIA: ModeloIA;

  @ApiProperty({ example: 0.7 })
  temperatura: number;

  @ApiProperty({ example: 2000 })
  maxTokens: number;

  @ApiProperty({ example: true })
  ativo: boolean;

  @ApiProperty({ example: 1 })
  versao: number;
}

export class RespostaAgenteDto {
  @ApiProperty({ example: '12345678-abcd-efgh-ijkl-123456789012' })
  id: string;

  @ApiProperty({ example: 'O que é programação orientada a objetos?' })
  pergunta: string;

  @ApiProperty({ example: 'Programação orientada a objetos (POO) é um paradigma de programação baseado no conceito de objetos...' })
  resposta: string;

  @ApiProperty({ example: 0.85 })
  confianca: number;

  @ApiProperty({ example: 1200, description: 'Tempo de resposta em milissegundos' })
  tempoResposta: number;

  @ApiProperty({ example: ['Módulo 1 - Introdução', 'Aula 3 - POO'], description: 'Fontes do conteúdo utilizadas' })
  fontes: string[];
}

export class ChatDto {
  @ApiProperty({ example: 'Como funciona herança em Java?', description: 'Pergunta para o agente de IA' })
  @IsString()
  @IsNotEmpty()
  pergunta: string;

  @ApiProperty({ example: 'session-abc-123', description: 'ID da sessão de chat para agrupar histórico' })
  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @ApiProperty({ example: 'f0e1d2c3-b4a5-6789-0123-456789abcdef', description: 'ID do curso (UUID)' })
  @IsUUID()
  cursoId: string;
}
