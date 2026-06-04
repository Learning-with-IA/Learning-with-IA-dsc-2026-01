import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  ForbiddenException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CursosService } from './cursos.service';
import { AgenteIAService } from './services/agente-ia.service';
import { MatriculasService } from '../matriculas/matriculas.service';
import { ChatDto, RespostaAgenteDto } from './dto/curso-agente.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('IA')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/ia')
export class IaController {
  constructor(
    private readonly cursosService: CursosService,
    private readonly agenteIAService: AgenteIAService,
    private readonly matriculasService: MatriculasService,
  ) {}

  @Post('chat')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Consultar o agente de IA do curso' })
  @ApiResponse({ status: 200, type: RespostaAgenteDto, description: 'Resposta gerada pelo agente de IA.' })
  @ApiResponse({ status: 403, description: 'Acesso negado. Matrícula inativa ou inexistente no curso.' })
  async chat(@Body() dto: ChatDto, @Req() req: any): Promise<RespostaAgenteDto> {
    const usuarioId = req.user.id;
    const { cursoId, pergunta, sessionId } = dto;

    // RN01: Validar matrícula ativa do aluno no curso correspondente
    const temMatricula = await this.matriculasService.verificarMatriculaAtiva(usuarioId, cursoId);
    if (!temMatricula) {
      throw new ForbiddenException('Apenas alunos com matrícula ativa podem usar o agente');
    }

    // Obter o agente do curso
    const agente = await this.cursosService.obterAgente(cursoId);

    // Chamar o serviço de IA
    const resposta = await this.agenteIAService.queryAgente(agente, pergunta);

    // Registrar a interação no log com o sessionId
    await this.cursosService.registrarInteracao(
      usuarioId,
      cursoId,
      pergunta,
      resposta.resposta,
      resposta.confianca,
      resposta.tempoResposta,
      sessionId,
    );

    return resposta;
  }
}
