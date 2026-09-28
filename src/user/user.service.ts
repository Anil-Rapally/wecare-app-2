import { Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { UserEntity } from './entity/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthService } from 'src/common/auth/auth.service';
import { CreateUserDto } from './dto/create_user.dto';
import { PhotoService } from './photo/photo.service';
import { OtpService } from './otp/otp.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class UserService {
    constructor(

        @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
        private readonly authService: AuthService,
        private readonly photos: PhotoService,
        private readonly optService: OtpService,
        private readonly i18n: I18nService

    ) { }

    async login(login_dto: LoginDto) {
        const result = await this.optService.generateOtp(login_dto.email);
        return {
            result,
            nextStep: 'verifyotp' as const,
        }
    }


    async verifyOtp(verify_otp_dto: VerifyOtpDto) {
        await this.optService.verifyOtp(verify_otp_dto.email, verify_otp_dto.otp);

        let user = await this.userRepository.findOne({ where: { email: verify_otp_dto.email } });
        if (!user) {
            user = this.userRepository.create({
                email: verify_otp_dto.email,
                is_profile_exists: false,
            });
            user = await this.userRepository.save(user);
        }

        if (!user.is_profile_exists) {
            const signup_token = await this.authService.issue_jwt(user.email, 'signup');
            return {
                signup_token,
                message: this.i18n.t('validation.otp_verified'),
                nextStep: 'userprofile' as const,
            };
        }

        const access_token = await this.authService.issue_jwt(user.email, 'access');
        return {
            access_token,
            message: this.i18n.t('validation.otp_verified'),
            nextStep: 'signup' as const,
        };
    }


    async createUser(userId: string, dto: CreateUserDto) {
        const user = await this.userRepository.findOne({ where: { id: userId } })
        if (!user) throw new NotFoundException(this.i18n.t('validation.user_not_found'));
        if (user.is_profile_exists) throw new ConflictException(this.i18n.t('validation.profile_exists'));
        user.full_name = dto.full_name;
        user.date_of_birth = dto.date_of_birth;
        user.gender = dto.gender;
        user.blood_group = dto.blood_group;
        user.emergency_contact = dto.emergency_contact;
        user.address = dto.address?.trim();
        user.is_profile_exists = true;

        await this.userRepository.save(user);

        const issued = await this.authService.issue_jwt(user.email, 'access');
        return {
            message: this.i18n.t('validation.profile_created'),
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
                message: this.i18n.t('validation.profile_photo_skipped'),
                is_profile_exists: true,
                profile_photo_url: null,
                nextStep: 'userprofile',
            };
        }
        const jpeg = await this.photos.check_photo(file.buffer);
        const result = await this.userRepository.update(
            {
                id: user_id,
                is_profile_exists: true,
            },
            { profile_photo: jpeg, profile_photo_url: '/user/profile-photo' },
        );
        return {
            message: this.i18n.t('validation.profile_updated'),
            is_profile_exists: true,
            profile_photo_url: '/user/profile-photo',
            nextStep: 'dashboard',
        };
    }

    publicUser(user: UserEntity) {
        return {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            date_of_birth: user.date_of_birth,
            gender: user.gender,
            blood_group: user.blood_group,
            emergency_contact: user.emergency_contact,
            address: user.address,
            profile_photo_url: user.profile_photo_url,
            profile_photo: user.profile_photo,
        };
    }


    async getProfilePhoto(userId: string): Promise<Buffer> {
        const user = await this.userRepository
            .createQueryBuilder('user')
            .select('user.id')
            .addSelect('user.profile_photo')
            .where('user.id = :userId', { userId })
            .getOne();
        if (!user?.profile_photo) throw new NotFoundException(this.i18n.t('validation.no_profile_photo'));
        return user.profile_photo;
    }
}
