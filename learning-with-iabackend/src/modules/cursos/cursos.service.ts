import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Curso, CursoStatus } from './entities/curso.entity';
import { CursoConteudo } from './entities/curso-conteudo.entity';
import { CursoAgente } from './entities/curso-agente.entity';
import { LogInteracao } from './entities/log-interacao.entity';
import { CreateCursoConteudoDto, UpdateCursoConteudoDto } from './dto/curso-conteudo.dto';
import { CreateCursoAgenteDto } from './dto/curso-agente.dto';
import type { ICursoRepository } from './repositories/curso.repository.interface';
import type { ICursoConteudoRepository } from './repositories/curso-conteudo.repository.interface';
import type { ICursoAgenteRepository } from './repositories/curso-agente.repository.interface';
import type { ILogInteracaoRepository } from './repositories/log-interacao.repository.interface';

@Injectable()
export class CursosService {
  constructor(
    @Inject('ICursoRepository')
    private readonly cursosRepository: ICursoRepository,
    @Inject('ICursoConteudoRepository')
    private readonly conteudoRepository: ICursoConteudoRepository,
    @Inject('ICursoAgenteRepository')
    private readonly agenteRepository: ICursoAgenteRepository,
    @Inject('ILogInteracaoRepository')
    private readonly logRepository: ILogInteracaoRepository,
  ) {}

  // ========== CURSOS ==========
  async listarCursosAtivos(): Promise<Curso[]> {
    return this.cursosRepository.listarCursosAtivos();
  }

  async obterCurso(id: string): Promise<Curso> {
    const curso = await this.cursosRepository.obterCursoById(id);
    if (!curso) throw new NotFoundException(`Curso "${id}" não encontrado`);
    return curso;
  }

  // ========== CONTEÚDO DO CURSO ==========
  async adicionarConteudo(cursoId: string, dto: CreateCursoConteudoDto): Promise<CursoConteudo> {
    await this.obterCurso(cursoId); // Valida se curso existe

    const conteudo = await this.conteudoRepository.salvarConteudo({
      cursoId,
      ...dto,
    });

    await this.atualizarTreinamentoAgente(cursoId); // Rebuild do agente
    return conteudo;
  }

  async listarConteudo(cursoId: string): Promise<CursoConteudo[]> {
    await this.obterCurso(cursoId);
    return this.conteudoRepository.listarConteudoAtivoPorCurso(cursoId);
  }

  async atualizarConteudo(
    cursoId: string,
    conteudoId: string,
    dto: UpdateCursoConteudoDto,
  ): Promise<CursoConteudo> {
    const conteudo = await this.conteudoRepository.obterConteudoByCurso(conteudoId, cursoId);
    if (!conteudo) throw new NotFoundException(`Conteúdo não encontrado`);

    const conteudoAtualizado = await this.conteudoRepository.atualizarConteudo(conteudoId, dto);
    await this.atualizarTreinamentoAgente(cursoId);
    return conteudoAtualizado;
  }

  async deletarConteudo(cursoId: string, conteudoId: string): Promise<void> {
    const deletado = await this.conteudoRepository.deletarConteudo(conteudoId, cursoId);
    if (!deletado) throw new NotFoundException(`Conteúdo não encontrado`);
    await this.atualizarTreinamentoAgente(cursoId);
  }

  // ========== AGENTE DO CURSO ==========
  async inicializarAgente(cursoId: string, dto?: CreateCursoAgenteDto): Promise<CursoAgente> {
    await this.obterCurso(cursoId);

    let agente = await this.agenteRepository.obterAgentePorCurso(cursoId);
    if (agente) return agente;

    agente = await this.agenteRepository.salvarAgente({
      cursoId,
      systemPrompt: `Você é um assistente de ensino especializado no curso "${cursoId}". 
Responda com base APENAS no conteúdo do curso fornecido. Se a pergunta não puder ser respondida com o conteúdo disponível, diga claramente.`,
      ...dto,
    });

    await this.atualizarTreinamentoAgente(cursoId);
    return agente;
  }

  private async atualizarTreinamentoAgente(cursoId: string): Promise<void> {
    const conteudos = await this.conteudoRepository.listarConteudoAtivoPorCurso(cursoId);

    const conteudoConsolidado = conteudos
      .map((c) => `[${c.tipo}] ${c.titulo}\n${c.conteudo}`)
      .join('\n\n---\n\n');

    let agente = await this.agenteRepository.obterAgentePorCurso(cursoId);
    if (!agente) {
      agente = await this.agenteRepository.salvarAgente({
        cursoId,
        conteudoTreinamento: conteudoConsolidado,
      });
    } else {
      await this.agenteRepository.atualizarAgente(cursoId, {
        conteudoTreinamento: conteudoConsolidado,
        versao: agente.versao + 1,
      });
    }
  }

  async obterAgente(cursoId: string): Promise<CursoAgente> {
    let agente = await this.agenteRepository.obterAgentePorCurso(cursoId);
    if (!agente) {
      agente = await this.inicializarAgente(cursoId);
    }
    return agente;
  }

  // ========== LOG DE INTERAÇÕES ==========
  async registrarInteracao(
    usuarioId: string,
    cursoId: string,
    pergunta: string,
    resposta: string,
    confianca: number = 0.8,
    tempoResposta: number = 0,
  ): Promise<LogInteracao> {
    return this.logRepository.salvarLog({
      usuarioId,
      cursoId,
      pergunta,
      resposta,
      confianca,
      tempoResposta,
    });
  }

  async obterHistorico(usuarioId: string, cursoId: string, limite: number = 50): Promise<LogInteracao[]> {
    return this.logRepository.obterHistorico(usuarioId, cursoId, limite);
  }
}
