import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Report } from './reports.entity';
import { Collection } from './collection.entity';

@Entity('report_share')
export class ReportShare {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'report_id', nullable: true })
  report_id: number | null;

  @Column({ name: 'collection_id', nullable: true })
  collection_id: number | null;

  @Column({
    name: 'permission',
    type: 'varchar',
    default: 'VIEW_ONLY',
  })
  permission: string;

  @Column({ name: 'expires_at', type: 'datetime', nullable: true })
  expires_at: Date;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @ManyToOne(() => Report, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'report_id' })
  report: Report | null;

  @ManyToOne(() => Collection, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'collection_id' })
  collection: Collection | null;
}
