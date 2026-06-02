import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';

@Entity('matriculas')
@Unique(['usuarioId', 'cursoId'])
export class Matricula {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  usuarioId: string;

  @Column({ type: 'uuid', nullable: false })
  cursoId: string;

  @Column({ type: 'boolean', default: true })
  ativa: boolean;

  @CreateDateColumn({ type: 'text' })
  criadoEm: Date;

  @UpdateDateColumn({ type: 'text' })
  atualizadoEm: Date;
}
