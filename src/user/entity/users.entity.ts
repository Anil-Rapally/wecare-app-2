import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { IsEnum, IsNotEmpty } from 'class-validator';

export enum Gender{
    Male = 'male',
    Female = 'female',
    Others = 'others'
}

export enum BloodGroup{
    A_POSITIVE = 'A+',
    A_NEGATIVE = 'A-',
    B_POSITIVE = 'B+',
    B_NEGATIVE = 'B-',
    AB_POSITIVE = 'AB+',
    AB_NEGATIVE = 'AB-',
    O_POSITIVE = 'O+',
    O_NEGATIVE = 'O-',
}

@Entity('Users')
@Unique(['email'])
export class UsersEntity {

    @PrimaryGeneratedColumn('uuid')
    @IsNotEmpty()
    id: string;

    @Column({ type: 'varchar', length: 300, nullable: false })
    @IsNotEmpty()
    email: string;

    @Column({ type: 'varchar', length: 200, nullable: false })
    @IsNotEmpty()
    full_name: string;

    @Column({ type: 'date', nullable: false })
    date_of_birth: string;

    @Column({ type: 'enum', enum: Gender, nullable: false })
    @IsNotEmpty()
    @IsEnum(Gender)
    gender: Gender;

    @Column({ type: 'enum', enum: BloodGroup, nullable: false })
    @IsNotEmpty()
    @IsEnum(BloodGroup)
    blood_group: BloodGroup;

    @Column({ type: 'varchar', length: 25, nullable: false })
    @IsNotEmpty()
    emergency_contact: string;

    @Column({ type: 'varchar', length: 500, nullable: true })
    address?: string;

    @Column({ type: 'mediumblob', nullable: true, select: false })
    profile_photo: Buffer | null;

    @Column({ default: false })
    is_profile_exists: boolean;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', nullable: true })
    updated_at: Date | null = null;

}

