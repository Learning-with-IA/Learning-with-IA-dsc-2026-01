import { Controller, Get, Post, Body, Param, Patch, Delete, HttpCode, HttpStatus, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CursosService } from './cursos.service';
import { AgenteIAService } from './services/agente-ia.service';
import { MatriculasService } from '../matriculas/matriculas.service';
import { CursoResponseDto } from './dto/curso-response.dto';
import { CreateCursoConteudoDto, UpdateCursoConteudoDto, CursoConteudoResponseDto } from './dto/curso-conteudo.dto';
import { CreateCursoAgenteDto, QueryAgenteDto, CursoAgenteResponseDto, RespostaAgenteDto } from './dto/curso-agente.dto';

@ApiTags('Cursos')
@Controller('api/v1/cursos')
export class CursosController {
  constructor(
    private readonly cursosService: CursosService,
    private readonly agenteIAService: AgenteIAService,
    private readonly matriculasService: MatriculasService,
  ) {}

  // ========== CURSOS ==========
  @Get()
  @ApiOperation({ summary: 'Listar todos os cursos ativos' })
  @ApiResponse({ status: 200, description: 'Lista de cursos ativos retornada com sucesso.', type: [CursoResponseDto] })
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
  @ApiOperation({ summary: 'Obter detalhes de um curso por ID' })
  @ApiParam({ name: 'cursoId', description: 'ID do curso (UUID)' })
  @ApiResponse({ status: 200, description: 'Detalhes do curso retornados com sucesso.', type: CursoResponseDto })
  @ApiResponse({ status: 404, description: 'Curso não encontrado.' })
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
  @ApiOperation({ summary: 'Adicionar conteúdo a um curso' })
  @ApiParam({ name: 'cursoId', description: 'ID do curso (UUID)' })
  @ApiResponse({ status: 201, description: 'Conteúdo adicionado com sucesso.', type: CursoConteudoResponseDto })
  @ApiResponse({ status: 404, description: 'Curso não encontrado.' })
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
  @ApiOperation({ summary: 'Listar conteúdos de um curso' })
  @ApiParam({ name: 'cursoId', description: 'ID do curso (UUID)' })
  @ApiResponse({ status: 200, description: 'Lista de conteúdos retornada com sucesso.', type: [CursoConteudoResponseDto] })
  @ApiResponse({ status: 404, description: 'Curso não encontrado.' })
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
  @ApiOperation({ summary: 'Atualizar conteúdo de um curso' })
  @ApiParam({ name: 'cursoId', description: 'ID do curso (UUID)' })
  @ApiParam({ name: 'conteudoId', description: 'ID do conteúdo (UUID)' })
  @ApiResponse({ status: 200, description: 'Conteúdo atualizado com sucesso.', type: CursoConteudoResponseDto })
  @ApiResponse({ status: 404, description: 'Curso ou conteúdo não encontrado.' })
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
  @ApiOperation({ summary: 'Remover conteúdo de um curso' })
  @ApiParam({ name: 'cursoId', description: 'ID do curso (UUID)' })
  @ApiParam({ name: 'conteudoId', description: 'ID do conteúdo (UUID)' })
  @ApiResponse({ status: 204, description: 'Conteúdo removido com sucesso.' })
  @ApiResponse({ status: 404, description: 'Curso ou conteúdo não encontrado.' })
  async deletarConteudo(
    @Param('cursoId') cursoId: string,
    @Param('conteudoId') conteudoId: string,
  ): Promise<void> {
    await this.cursosService.deletarConteudo(cursoId, conteudoId);
  }

  // ========== AGENTE DE IA ==========
  @Post(':cursoId/agente/inicializar')
  @ApiOperation({ summary: 'Inicializar agente de IA para o curso' })
  @ApiParam({ name: 'cursoId', description: 'ID do curso (UUID)' })
  @ApiResponse({ status: 201, description: 'Agente inicializado com sucesso.', type: CursoAgenteResponseDto })
  @ApiResponse({ status: 404, description: 'Curso não encontrado.' })
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
  @ApiOperation({ summary: 'Obter agente de IA do curso' })
  @ApiParam({ name: 'cursoId', description: 'ID do curso (UUID)' })
  @ApiResponse({ status: 200, description: 'Dados do agente retornados com sucesso.', type: CursoAgenteResponseDto })
  @ApiResponse({ status: 404, description: 'Curso não encontrado.' })
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
  @ApiOperation({ summary: 'Enviar pergunta ao agente de IA do curso' })
  @ApiParam({ name: 'cursoId', description: 'ID do curso (UUID)' })
  @ApiResponse({ status: 201, description: 'Resposta do agente retornada com sucesso.', type: RespostaAgenteDto })
  @ApiResponse({ status: 400, description: 'Agente sem conteúdo de treinamento.' })
  @ApiResponse({ status: 403, description: 'Matrícula ativa necessária para usar o agente.' })
  @ApiResponse({ status: 404, description: 'Curso não encontrado.' })
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
  @ApiOperation({ summary: 'Obter histórico de interações do aluno com o agente' })
  @ApiParam({ name: 'cursoId', description: 'ID do curso (UUID)' })
  @ApiParam({ name: 'usuarioId', description: 'ID do usuário (UUID)' })
  @ApiResponse({ status: 200, description: 'Histórico de interações retornado com sucesso.' })
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
