import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum UserRole {
  ADMIN = 'ADMIN',
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  password: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({
    type: 'varchar',
    length: 50,
    enum: UserRole,
    default: UserRole.STUDENT,
  })
  role: UserRole;

  @Column({ type: 'varchar', length: 255, nullable: true })
  recoveryToken: string | null;

  @Column({ type: 'timestamp', nullable: true })
  recoveryTokenExpires: Date | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'text' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'text' })
  updatedAt: Date;
}
