import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Curso } from './curso.entity';

@Entity('log_interacao')
export class LogInteracao {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  usuarioId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuarioId' })
  usuario: User;

  @Column({ type: 'uuid', nullable: false })
  cursoId: string;

  @ManyToOne(() => Curso, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cursoId' })
  curso: Curso;

  @Column({ type: 'text', nullable: false })
  pergunta: string; // 📝 Pergunta do aluno

  @Column({ type: 'text', nullable: false })
  resposta: string; // 🤖 Resposta do agente

  @Column({ type: 'float', nullable: true })
  confianca: number; // Confiança da resposta (0-1)

  @Column({ type: 'text', nullable: true })
  fontes: string; // JSON com fontes de informação usadas

  @Column({ type: 'int', default: 0 })
  tempoResposta: number; // Tempo em ms

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;
}
