import { Controller, Get } from '@nestjs/common';
import { CursosService } from './cursos.service';
import { CursoResponseDto } from './dto/curso-response.dto';

@Controller('api/v1/cursos')
export class CursosController {
  constructor(private readonly cursosService: CursosService) {}

  @Get()
  async listarCursos(): Promise<CursoResponseDto[]> {
    const cursos = await this.cursosService.listarCursosAtivos();
    return cursos.map(({ id, nome, descricao, cargaHoraria, imagemUrl }) => ({
      id,
      nome,
      descricao,
      cargaHoraria,
      imagemUrl,
    }));
  }
}
