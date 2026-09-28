import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { UserEntity } from './user.entity';
import { IsNotEmpty } from 'class-validator';


@Entity('Otps')
export class OtpEntity {

    @PrimaryColumn({ type: 'varchar', length: 300 })
    @IsNotEmpty()
    email!: string;

    @Column()
    otp_hash!: string;

    @Column({ type: 'varchar', length: 36, name: 'user_id', nullable: true })
    user_id!: string | null;

    @Column({ type: 'int', unsigned: true, default: 0 })
    resend_count = 0;

    @Column({ type: 'datetime' })
    daily_count_reset_at!: Date;

    @Column({ type: 'int', unsigned: true, default: 0 })
    daily_resend_count = 0;

    @Column({ type: 'datetime' })
    next_resend_at!: Date;

    @CreateDateColumn({ type: 'datetime' })
    created_at!: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    expires_at!: Date;

    @ManyToOne(() => UserEntity, (user) => user.otps, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user!: UserEntity;


}