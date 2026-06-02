import { Controller, Get, Post, Patch, Body, Param, ParseBoolPipe } from '@nestjs/common';
import { MatriculasService } from './matriculas.service';
import { CriarMatriculaDto, MatriculaResponseDto, AtualizarMatriculaDto } from './dto/matricula.dto';

@Controller('api/v1/matriculas')
export class MatriculasController {
  constructor(private readonly matriculasService: MatriculasService) {}

  @Post()
  async criar(@Body() dto: CriarMatriculaDto): Promise<MatriculaResponseDto> {
    const matricula = await this.matriculasService.criar(dto);
    return {
      id: matricula.id,
      usuarioId: matricula.usuarioId,
      cursoId: matricula.cursoId,
      ativa: matricula.ativa,
      criadoEm: matricula.criadoEm,
    };
  }

  @Get('usuario/:usuarioId')
  async listarPorUsuario(@Param('usuarioId') usuarioId: string): Promise<MatriculaResponseDto[]> {
    const matriculas = await this.matriculasService.listarPorUsuario(usuarioId);
    return matriculas.map((m) => ({
      id: m.id,
      usuarioId: m.usuarioId,
      cursoId: m.cursoId,
      ativa: m.ativa,
      criadoEm: m.criadoEm,
    }));
  }

  @Patch(':id/status')
  async atualizarStatus(
    @Param('id') id: string,
    @Body() dto: AtualizarMatriculaDto,
  ): Promise<MatriculaResponseDto> {
    const matricula = await this.matriculasService.atualizarStatus(id, dto.ativa ?? true);
    return {
      id: matricula.id,
      usuarioId: matricula.usuarioId,
      cursoId: matricula.cursoId,
      ativa: matricula.ativa,
      criadoEm: matricula.criadoEm,
    };
  }
}
