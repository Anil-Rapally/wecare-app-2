import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany
} from "typeorm";
import { Report } from "./reports.entity";

@Entity("collection")
export class Collection {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  name!: string;

  @ManyToMany(() => Report, (report) => report.collections)
  reports!: Report[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ name: 'is_archived', type: 'boolean', default: false })
  is_archived!: boolean;
  
}