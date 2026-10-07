import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { UsersEntity } from './entity/users.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthService } from 'src/common/auth/auth.service';
import { CreateUserDto } from './dto/create_user.dto';
import { OtpService } from './otp/otp.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class UserService {
    constructor(

        @InjectRepository(UsersEntity) private readonly userRepository: Repository<UsersEntity>,
        private readonly authService: AuthService,
        private readonly optService: OtpService,
        private readonly i18n: I18nService

    ) { }

    async login(login_dto: LoginDto) {
        if (!login_dto.otp) {
            await this.optService.generateOtp(login_dto.email);
            return {
                message: 'validation.otp_sent_successfully',
            };
        }

        const verification = await this.optService.verifyOtp(login_dto.email, login_dto.otp);
        if (!verification.verified) {
            throw new UnauthorizedException({ message: verification.message });
        }

        let user = await this.userRepository.findOne({ where: { email: login_dto.email } });
        if (!user) {
            user = this.userRepository.create({
                email: login_dto.email,
                is_profile_exists: false,
            });
            user = await this.userRepository.save(user);
        }
        if (user.is_profile_exists) {
            const issued = await this.authService.issue_jwt(user.email, 'access');
            return {
                access_token: issued.token,
                token_type: 'Bearer',
                expires_in: issued.expires_in,
                message: 'validation.otp_verified',
                nextStep: 'dashboard' as const,
            };
        }
        const issued = await this.authService.issue_jwt(user.email, 'signup');
        return {
            signup_token: issued.token,
            token_type: 'Bearer',
            expires_in: issued.expires_in,
            message: 'validation.otp_verified',
            nextStep: 'userprofile' as const,
        };
    }




    async createUser(userId: string, dto: CreateUserDto) {
        const user = await this.userRepository.findOne({ where: { id: userId } })
        if (!user) throw new NotFoundException({ message: 'validation.user_not_found' });
        if (user.is_profile_exists) throw new ConflictException({ message: 'validation.profile_exists' });
        user.full_name = dto.full_name;
        user.date_of_birth = dto.date_of_birth;
        user.gender = dto.gender;
        user.blood_group = dto.blood_group;
        user.emergency_contact = dto.emergency_contact;
        user.address = dto.address?.trim();
        user.is_profile_exists = true;
        user.created_at = new Date();

        await this.userRepository.save(user);

        const issued = await this.authService.issue_jwt(user.email, 'access');
        return {
            message: 'validation.profile_created',
            is_profile_exists: user.is_profile_exists,
            access_token: issued.token,
            token_type: 'Bearer',
            expires_in: issued.expires_in,
            next_step: 'uploadphoto' as const,
            user: this.publicUser(user),
        };
    }

    async uploadProfilePhoto(user_id: string, file: Express.Multer.File) {
        if (!file) {
            return {
                message: 'validation.profile_photo_skipped',
                is_profile_exists: true,
                nextStep: 'userprofile',
            };
        }
        const result = await this.userRepository.update(
            { id: user_id }, { is_profile_exists: true, profile_photo: file.buffer }
        );
        return {
            result,
            message: 'validation.profile_updated',
            is_profile_exists: true,
            nextStep: 'dashboard',
        };
    }

    publicUser(user: UsersEntity) {
        return {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            date_of_birth: user.date_of_birth,
            gender: user.gender,
            blood_group: user.blood_group,
            emergency_contact: user.emergency_contact,
            address: user.address,
            profile_photo: user.profile_photo,
            created_at: user.created_at,
            updated_at: user.updated_at,
        };
    }


    async getProfilePhoto(userId: string): Promise<Buffer> {
        const user = await this.userRepository
            .createQueryBuilder('user')
            .select('user.id')
            .addSelect('user.profile_photo')
            .where('user.id = :userId', { userId })
            .getOne();
        if (!user?.profile_photo) throw new NotFoundException({ message: 'validation.no_profile_photo' });
        return user.profile_photo;
    }
}
