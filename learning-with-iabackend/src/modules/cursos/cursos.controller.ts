import { Controller, Get, Post, Body, Param, Patch, Delete, HttpCode, HttpStatus, ForbiddenException } from '@nestjs/common';
import { CursosService } from './cursos.service';
import { AgenteIAService } from './services/agente-ia.service';
import { MatriculasService } from '../matriculas/matriculas.service';
import { CursoResponseDto } from './dto/curso-response.dto';
import { CreateCursoConteudoDto, UpdateCursoConteudoDto, CursoConteudoResponseDto } from './dto/curso-conteudo.dto';
import { CreateCursoAgenteDto, QueryAgenteDto, CursoAgenteResponseDto, RespostaAgenteDto } from './dto/curso-agente.dto';

@Controller('api/v1/cursos')
export class CursosController {
  constructor(
    private readonly cursosService: CursosService,
    private readonly agenteIAService: AgenteIAService,
    private readonly matriculasService: MatriculasService,
  ) {}

  // ========== CURSOS ==========
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

  @Get(':cursoId')
  async obterCurso(@Param('cursoId') cursoId: string): Promise<CursoResponseDto> {
    const curso = await this.cursosService.obterCurso(cursoId);
    return {
      id: curso.id,
      nome: curso.nome,
      descricao: curso.descricao,
      cargaHoraria: curso.cargaHoraria,
      imagemUrl: curso.imagemUrl,
    };
  }

  // ========== CONTEÚDO ==========
  @Post(':cursoId/conteudo')
  async adicionarConteudo(
    @Param('cursoId') cursoId: string,
    @Body() dto: CreateCursoConteudoDto,
  ): Promise<CursoConteudoResponseDto> {
    const conteudo = await this.cursosService.adicionarConteudo(cursoId, dto);
    return {
      id: conteudo.id,
      cursoId: conteudo.cursoId,
      titulo: conteudo.titulo,
      tipo: conteudo.tipo,
      ordem: conteudo.ordem,
      ativo: conteudo.ativo,
      criadoEm: conteudo.criadoEm,
    };
  }

  @Get(':cursoId/conteudo')
  async listarConteudo(
    @Param('cursoId') cursoId: string,
  ): Promise<CursoConteudoResponseDto[]> {
    const conteudos = await this.cursosService.listarConteudo(cursoId);
    return conteudos.map((c) => ({
      id: c.id,
      cursoId: c.cursoId,
      titulo: c.titulo,
      tipo: c.tipo,
      ordem: c.ordem,
      ativo: c.ativo,
      criadoEm: c.criadoEm,
    }));
  }

  @Patch(':cursoId/conteudo/:conteudoId')
  async atualizarConteudo(
    @Param('cursoId') cursoId: string,
    @Param('conteudoId') conteudoId: string,
    @Body() dto: UpdateCursoConteudoDto,
  ): Promise<CursoConteudoResponseDto> {
    const conteudo = await this.cursosService.atualizarConteudo(cursoId, conteudoId, dto);
    return {
      id: conteudo.id,
      cursoId: conteudo.cursoId,
      titulo: conteudo.titulo,
      tipo: conteudo.tipo,
      ordem: conteudo.ordem,
      ativo: conteudo.ativo,
      criadoEm: conteudo.criadoEm,
    };
  }

  @Delete(':cursoId/conteudo/:conteudoId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletarConteudo(
    @Param('cursoId') cursoId: string,
    @Param('conteudoId') conteudoId: string,
  ): Promise<void> {
    await this.cursosService.deletarConteudo(cursoId, conteudoId);
  }

  // ========== AGENTE DE IA ==========
  @Post(':cursoId/agente/inicializar')
  async inicializarAgente(
    @Param('cursoId') cursoId: string,
    @Body() dto?: CreateCursoAgenteDto,
  ): Promise<CursoAgenteResponseDto> {
    const agente = await this.cursosService.inicializarAgente(cursoId, dto);
    return {
      id: agente.id,
      cursoId: agente.cursoId,
      modeloIA: agente.modeloIA,
      temperatura: agente.temperatura,
      maxTokens: agente.maxTokens,
      ativo: agente.ativo,
      versao: agente.versao,
    };
  }

  @Get(':cursoId/agente')
  async obterAgente(@Param('cursoId') cursoId: string): Promise<CursoAgenteResponseDto> {
    const agente = await this.cursosService.obterAgente(cursoId);
    return {
      id: agente.id,
      cursoId: agente.cursoId,
      modeloIA: agente.modeloIA,
      temperatura: agente.temperatura,
      maxTokens: agente.maxTokens,
      ativo: agente.ativo,
      versao: agente.versao,
    };
  }

  // ========== QUERY DO AGENTE ==========
  @Post(':cursoId/agente/query')
  async queryAgente(
    @Param('cursoId') cursoId: string,
    @Body() dto: QueryAgenteDto,
  ): Promise<RespostaAgenteDto> {
    const usuarioId = dto.usuarioId;
    if (usuarioId) {
      const temMatricula = await this.matriculasService.verificarMatriculaAtiva(usuarioId, cursoId);
      if (!temMatricula) {
        throw new ForbiddenException('Apenas alunos com matrícula ativa podem usar o agente');
      }
    }

    const agente = await this.cursosService.obterAgente(cursoId);
    const resposta = await this.agenteIAService.queryAgente(agente, dto.pergunta);

    if (usuarioId) {
      await this.cursosService.registrarInteracao(
        usuarioId,
        cursoId,
        dto.pergunta,
        resposta.resposta,
        resposta.confianca,
        resposta.tempoResposta,
      );
    }

    return resposta;
  }

  // ========== HISTÓRICO ==========
  @Get(':cursoId/agente/historico/:usuarioId')
  async obterHistorico(
    @Param('cursoId') cursoId: string,
    @Param('usuarioId') usuarioId: string,
  ) {
    const historico = await this.cursosService.obterHistorico(usuarioId, cursoId);
    return historico.map((log) => ({
      id: log.id,
      pergunta: log.pergunta,
      resposta: log.resposta,
      confianca: log.confianca,
      criadoEm: log.criadoEm,
    }));
  }
}
