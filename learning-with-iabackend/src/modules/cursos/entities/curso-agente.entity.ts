import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { Curso } from './curso.entity';

export enum ModeloIA {
  GPT_4 = 'GPT_4',
  GPT_3_5 = 'GPT_3_5',
  LLAMA = 'LLAMA',
  CLAUDE = 'CLAUDE',
  CUSTOM = 'CUSTOM',
}

@Entity('curso_agente')
export class CursoAgente {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  cursoId: string;

  @OneToOne(() => Curso, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cursoId' })
  curso: Curso;

  @Column({ type: 'varchar', length: 20, default: ModeloIA.GPT_3_5 })
  modeloIA: ModeloIA;

  @Column({ type: 'text', nullable: true })
  systemPrompt: string; // Instruções para comportamento do agente

  @Column({ type: 'float', default: 0.7 })
  temperatura: number; // Criatividade da resposta (0-1)

  @Column({ type: 'int', default: 2000 })
  maxTokens: number; // Limite de tokens por resposta

  @Column({ type: 'text', nullable: true })
  conteudoTreinamento: string; // Cache do conteúdo consolidado

  @Column({ type: 'boolean', default: true })
  ativo: boolean;

  @Column({ type: 'int', default: 0 })
  versao: number; // Versionamento do agente

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm: Date;
}
