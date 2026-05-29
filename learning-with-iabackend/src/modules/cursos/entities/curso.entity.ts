import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BeforeInsert, BeforeUpdate } from 'typeorm';

export enum CursoStatus {
  ATIVO = 'ATIVO',
  INATIVO = 'INATIVO',
}

@Entity('cursos')
export class Curso {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  nome: string;

  @Column({ type: 'text', nullable: false })
  descricao: string;

  @Column({ type: 'int', nullable: false })
  cargaHoraria: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  imagemUrl: string | null;

  @Column({ type: 'varchar', length: 10, default: CursoStatus.ATIVO })
  status: CursoStatus;

  @CreateDateColumn({ type: 'text', name: 'criado_em' })
  criadoEm: Date;

  @UpdateDateColumn({ type: 'text', name: 'atualizado_em' })
  atualizadoEm: Date;

  @BeforeInsert()
  @BeforeUpdate()
  validateStatus(): void {
    if (!Object.values(CursoStatus).includes(this.status)) {
      throw new Error(`Status inválido: ${this.status}`);
    }
  }
}
