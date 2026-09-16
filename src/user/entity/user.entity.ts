import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { IsNotEmpty, Matches } from 'class-validator';
import { OtpEntity } from './otp.entity';


@Entity('User')
@Unique(['email'])
export class UserEntity {

    @PrimaryGeneratedColumn('uuid')
    @IsNotEmpty()
    id!: string;

    @Column({ type: 'varchar', length: 300, nullable: false })
    @IsNotEmpty()
    email!: string;


    @Column({ type: 'varchar', length: 200, nullable: true })
    @IsNotEmpty()
    fullName!: string;

    @Column({ type: 'date', nullable: true })
    dateOfBirth!: string;

    @Column({ type: 'varchar', length: 20, nullable: true })
    @IsNotEmpty()
    @Matches(/^(male|female|other)$/)
    gender!: string;

    @Column({ type: 'varchar', length: 3, nullable: true })
    @IsNotEmpty()
    @Matches(/^(A|B|AB|O)[+-]$/)
    bloodGroup!: string;

    @Column({ type: 'varchar', length: 25, nullable: true })
    @IsNotEmpty()
    emergencyContact!: string;

    @Column({ type: 'varchar', length: 500, nullable: true })
    address?: string;

    @Column({ type: 'varchar', length: 500, nullable: true })
    profilePhotoUrl!: string | null;

    @Column({ type: 'mediumblob', nullable: true, select: false })
    profilePhoto!: Buffer | null;

    @Column({ default: false })
    isEmailVerified!: boolean;

    @Column({ default: false })
    isProfileExists!: boolean;

    @OneToMany(() => OtpEntity, (otp) => otp.user)
    otps!: OtpEntity[];
}

