import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Curso, CursoStatus } from './entities/curso.entity';
import { CursoConteudo } from './entities/curso-conteudo.entity';
import { CursoAgente } from './entities/curso-agente.entity';
import { LogInteracao } from './entities/log-interacao.entity';
import { CreateCursoConteudoDto, UpdateCursoConteudoDto } from './dto/curso-conteudo.dto';
import { CreateCursoAgenteDto } from './dto/curso-agente.dto';

@Injectable()
export class CursosService {
  constructor(
    @InjectRepository(Curso)
    private readonly cursosRepository: Repository<Curso>,
    @InjectRepository(CursoConteudo)
    private readonly conteudoRepository: Repository<CursoConteudo>,
    @InjectRepository(CursoAgente)
    private readonly agenteRepository: Repository<CursoAgente>,
    @InjectRepository(LogInteracao)
    private readonly logRepository: Repository<LogInteracao>,
  ) {}

  // ========== CURSOS ==========
  async listarCursosAtivos(): Promise<Curso[]> {
    return this.cursosRepository.find({
      where: {
        status: CursoStatus.ATIVO,
      },
    });
  }

  async obterCurso(id: string): Promise<Curso> {
    const curso = await this.cursosRepository.findOne({ where: { id } });
    if (!curso) throw new NotFoundException(`Curso "${id}" não encontrado`);
    return curso;
  }

  // ========== CONTEÚDO DO CURSO ==========
  async adicionarConteudo(cursoId: string, dto: CreateCursoConteudoDto): Promise<CursoConteudo> {
    await this.obterCurso(cursoId); // Valida se curso existe

    const conteudo = this.conteudoRepository.create({
      cursoId,
      ...dto,
    });

    await this.conteudoRepository.save(conteudo);
    await this.atualizarTreinamentoAgente(cursoId); // Rebuild do agente
    return conteudo;
  }

  async listarConteudo(cursoId: string): Promise<CursoConteudo[]> {
    await this.obterCurso(cursoId);
    return this.conteudoRepository.find({
      where: { cursoId, ativo: true },
      order: { ordem: 'ASC' },
    });
  }

  async atualizarConteudo(
    cursoId: string,
    conteudoId: string,
    dto: UpdateCursoConteudoDto,
  ): Promise<CursoConteudo> {
    const conteudo = await this.conteudoRepository.findOne({
      where: { id: conteudoId, cursoId },
    });
    if (!conteudo) throw new NotFoundException(`Conteúdo não encontrado`);

    Object.assign(conteudo, dto);
    await this.conteudoRepository.save(conteudo);
    await this.atualizarTreinamentoAgente(cursoId);
    return conteudo;
  }

  async deletarConteudo(cursoId: string, conteudoId: string): Promise<void> {
    const result = await this.conteudoRepository.delete({
      id: conteudoId,
      cursoId,
    });
    if (result.affected === 0) throw new NotFoundException(`Conteúdo não encontrado`);
    await this.atualizarTreinamentoAgente(cursoId);
  }

  // ========== AGENTE DO CURSO ==========
  async inicializarAgente(cursoId: string, dto?: CreateCursoAgenteDto): Promise<CursoAgente> {
    await this.obterCurso(cursoId);

    let agente = await this.agenteRepository.findOne({ where: { cursoId } });
    if (agente) return agente;

    agente = this.agenteRepository.create({
      cursoId,
      systemPrompt: `Você é um assistente de ensino especializado no curso "${cursoId}". 
Responda com base APENAS no conteúdo do curso fornecido. Se a pergunta não puder ser respondida com o conteúdo disponível, diga claramente.`,
      ...dto,
    });

    await this.agenteRepository.save(agente);
    await this.atualizarTreinamentoAgente(cursoId);
    return agente;
  }

  private async atualizarTreinamentoAgente(cursoId: string): Promise<void> {
    const conteudos = await this.conteudoRepository.find({
      where: { cursoId, ativo: true },
      order: { ordem: 'ASC' },
    });

    const conteudoConsolidado = conteudos
      .map((c) => `[${c.tipo}] ${c.titulo}\n${c.conteudo}`)
      .join('\n\n---\n\n');

    let agente = await this.agenteRepository.findOne({ where: { cursoId } });
    if (!agente) {
      agente = this.agenteRepository.create({
        cursoId,
        conteudoTreinamento: conteudoConsolidado,
      });
    } else {
      agente.conteudoTreinamento = conteudoConsolidado;
      agente.versao += 1;
    }

    await this.agenteRepository.save(agente);
  }

  async obterAgente(cursoId: string): Promise<CursoAgente> {
    let agente = await this.agenteRepository.findOne({ where: { cursoId } });
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
    const log = this.logRepository.create({
      usuarioId,
      cursoId,
      pergunta,
      resposta,
      confianca,
      tempoResposta,
    });

    return this.logRepository.save(log);
  }

  async obterHistorico(usuarioId: string, cursoId: string, limite: number = 50): Promise<LogInteracao[]> {
    return this.logRepository.find({
      where: { usuarioId, cursoId },
      order: { criadoEm: 'DESC' },
      take: limite,
    });
  }
}
