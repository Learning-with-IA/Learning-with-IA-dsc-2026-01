import { ApiProperty } from '@nestjs/swagger';

export class CursoResponseDto {
  @ApiProperty({ example: 'f0e1d2c3-b4a5-6789-0123-456789abcdef' })
  id: string;

  @ApiProperty({ example: 'Programação Web com NestJS' })
  nome: string;

  @ApiProperty({ example: 'Aprenda a criar APIs REST profissionais com NestJS' })
  descricao: string;

  @ApiProperty({ example: 40, description: 'Carga horária em horas' })
  cargaHoraria: number;

  @ApiProperty({ example: 'https://exemplo.com/imagem-curso.png', nullable: true })
  imagemUrl: string | null;
}
