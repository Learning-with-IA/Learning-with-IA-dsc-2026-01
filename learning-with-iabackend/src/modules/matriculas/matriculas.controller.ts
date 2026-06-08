import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MatriculasService } from './matriculas.service';
import {
  CriarMatriculaDto,
  MatriculaResponseDto,
  AtualizarMatriculaDto,
} from './dto/matricula.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Matrículas')
@ApiBearerAuth()
@Controller('api/v1/matriculas')
export class MatriculasController {
  constructor(private readonly matriculasService: MatriculasService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Matricular aluno em curso (apenas STUDENT)' })
  @ApiResponse({ status: 201, description: 'Matrícula criada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Curso indisponível (RN03) ou payload inválido.' })
  @ApiResponse({ status: 401, description: 'Token de autenticação ausente ou inválido.' })
  @ApiResponse({ status: 403, description: 'Usuário sem permissão (perfil diferente de STUDENT).' })
  @ApiResponse({ status: 404, description: 'Curso não encontrado.' })
  @ApiResponse({ status: 409, description: 'Aluno já possui matrícula ativa neste curso.' })
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
  @UseGuards(JwtAuthGuard)
  async listarPorUsuario(
    @Param('usuarioId') usuarioId: string,
  ): Promise<MatriculaResponseDto[]> {
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
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
