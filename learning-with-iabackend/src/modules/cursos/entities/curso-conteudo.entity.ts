import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Curso } from './curso.entity';

export enum TipoConteudo {
  TEXTO = 'TEXTO',
  VIDEO = 'VIDEO',
  DOCUMENTO = 'DOCUMENTO',
  EXERCICIO = 'EXERCICIO',
  QUIZ = 'QUIZ',
}

@Entity('curso_conteudo')
export class CursoConteudo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  cursoId: string;

  @ManyToOne(() => Curso, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cursoId' })
  curso: Curso;

  @Column({ type: 'varchar', length: 255, nullable: false })
  titulo: string;

  @Column({ type: 'text', nullable: false })
  conteudo: string; // 🔑 Conteúdo usado para treinar o agente

  @Column({ type: 'varchar', length: 20, default: TipoConteudo.TEXTO })
  tipo: TipoConteudo;

  @Column({ type: 'int', default: 0 })
  ordem: number; // Ordenação de apresentação

  @Column({ type: 'boolean', default: true })
  ativo: boolean;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm: Date;
}
