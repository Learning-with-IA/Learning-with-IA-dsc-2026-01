import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: false })
  eventDate: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location: string;

  @Column({ type: 'integer', default: 0 })
  capacity: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'text' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'text' })
  updatedAt: Date;
}
