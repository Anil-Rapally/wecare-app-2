import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Collection } from "./collection.entity";

@Entity("report")
export class Report {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  report_name!: string;

  @Column()
  report_type!: string;

  @Column({type:'date'})
  report_date!: Date;

  @Column()
  Hospital_Or_Diagnostic_Center!: string;

  @Column()
  Doctor_name!: string;

  @Column({ nullable: true })
  tags!: string;

  @Column()
  file_name!: string;

  @Column()
  file_type!: string;

  @Column()
  file_size!: number;

  @Column({type:'longblob'})
  file_data!: Buffer;

  @ManyToOne(() => Collection, (collection) => collection.reports,{nullable:true})
  @JoinColumn({ name: "collection_id" })
  collection!: Collection;
  
  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date; 
  
}