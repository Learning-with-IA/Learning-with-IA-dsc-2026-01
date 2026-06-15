import { IsUUID, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CriarMatriculaDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', description: 'ID do usuário (UUID)' })
  @IsUUID()
  usuarioId: string;

  @ApiProperty({ example: 'f0e1d2c3-b4a5-6789-0123-456789abcdef', description: 'ID do curso (UUID)' })
  @IsUUID()
  cursoId: string;
}

export class AtualizarMatriculaDto {
  @ApiProperty({ example: true, description: 'Status da matrícula (ativa/inativa)', required: false })
  @IsBoolean()
  @IsOptional()
  ativa?: boolean;
}

export class MatriculaResponseDto {
  @ApiProperty({ example: '12345678-abcd-efgh-ijkl-123456789012' })
  id: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  usuarioId: string;

  @ApiProperty({ example: 'f0e1d2c3-b4a5-6789-0123-456789abcdef' })
  cursoId: string;

  @ApiProperty({ example: true })
  ativa: boolean;

  @ApiProperty({ example: '2026-06-15T12:00:00.000Z' })
  criadoEm: Date;
}
