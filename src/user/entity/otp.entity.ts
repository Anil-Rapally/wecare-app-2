import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('Otps')
export class OtpEntity {
    @Column({ type: 'varchar', length: 36 })
    otpId!: string;

    @Column()
    otpHash!: string;


    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt!: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', nullable: true })
    expiresAt: Date | null = null;

    @Column({ type: 'datetime', nullable: true })
    lastSentAt: Date | null = null;

    @Column({ type: 'datetime', nullable: true })
    sendWindowStartedAt: Date | null = null;

    @Column({ type: 'int', unsigned: true, default: 0 })
    sendCount = 0;

    @Column({ type: 'datetime', nullable: true })
    failureWindowStartedAt: Date | null = null;

    @Column({ type: 'int', unsigned: true, default: 0 })
    failedAttempts = 0;

    @Column({ type: 'datetime', nullable: true })
    lockedUntil: Date | null = null;

    @PrimaryColumn({ type: 'varchar', length: 36 })
    userId!: string;

    @ManyToOne(() => UserEntity, (user) => user.otps, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user!: UserEntity;


}