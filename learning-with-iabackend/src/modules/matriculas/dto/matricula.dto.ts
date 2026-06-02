import { IsUUID, IsBoolean, IsOptional } from 'class-validator';

export class CriarMatriculaDto {
  @IsUUID()
  usuarioId: string;

  @IsUUID()
  cursoId: string;
}

export class AtualizarMatriculaDto {
  @IsBoolean()
  @IsOptional()
  ativa?: boolean;
}

export class MatriculaResponseDto {
  id: string;
  usuarioId: string;
  cursoId: string;
  ativa: boolean;
  criadoEm: Date;
}
