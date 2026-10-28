import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { UsersEntity } from './entity/users.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthService } from 'src/common/auth/auth.service';
import { CreateUserDto } from './dto/create_user.dto';
import { OtpService } from './otp/otp.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UpdateUserProfileDto } from './dto/update_user_profile.dto';

@Injectable()
export class UserService {
    constructor(

        @InjectRepository(UsersEntity) private readonly userRepository: Repository<UsersEntity>,
        private readonly authService: AuthService,
        private readonly optService: OtpService,

    ) { }

    async login(login_dto: LoginDto) {
        const value = login_dto.email || login_dto.phone_number;

        if (!login_dto.otp) {
            console.log('otp genertion called');
            return await this.optService.generateOtp(value);
        }

        const verification = await this.optService.verifyOtp(value, login_dto.otp,);
        if (!verification.verified) {
            throw new UnauthorizedException({ message: 'validation.incorrect_otp' });
        }
        const where = login_dto.email ? { email: value } : { phone_number: value };

        let user = await this.userRepository.findOne({ where });
        if (!user) {
            user = this.userRepository.create({
                email: login_dto.email,
                phone_number: login_dto.phone_number,
                is_profile_exists: false,
            });
            user = await this.userRepository.save(user);
        }
        const issued = await this.authService.issue_jwt(user.id);
        const result = {
            id: user.id,
            email: user.email,
            phone_number: user.phone_number,
            is_profile_exists: user.is_profile_exists,
        }
        if (user.is_profile_exists) {
            return result;
        }
        return {
            ...result,
            token: issued.token,
            token_type: 'Bearer',
            expires_in: issued.expires_in,
            message: 'validation.otp_verified',
            nextStep: 'setupprofile' as const,
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

        const issued = await this.authService.issue_jwt(user.id);
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
            { id: user_id }, { is_profile_exists: true, profile_photo: file.buffer, is_photo_exists: true, }
        );
        return {
            result,
            message: 'validation.profile_updated',
            is_profile_exists: true,
            is_photo_exists: true,
            nextStep: 'dashboard',
        };
    }

    publicUser(user: UsersEntity) {
        return {
            id: user.id,
            email: user.email,
            phone_number: user.phone_number,
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
        const user = await this.userRepository.findOne({
            where: { id: userId },
            select: {
                id: true,
                profile_photo: true,
            },
        });
        if (!user?.profile_photo) throw new NotFoundException({ message: 'validation.no_profile_photo' });
        return user.profile_photo;
    }


    async skipSignup(userId: string) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (user?.is_profile_exists === false) {
            await this.userRepository.update({ id: userId }, { is_profile_exists: true, })
            const issued = await this.authService.issue_jwt(user.id);
            return {
                message: 'validation.profile_skiped',
                access_token: issued.token,
                expires_in: issued.expires_in,
                next_step: 'home screen',
            }
        }
        if (user?.is_profile_exists === true && user.is_photo_exists === false) {
            await this.userRepository.update({ id: userId }, { is_profile_exists: true, is_photo_exists: true });
            const issued = await this.authService.issue_jwt(user.id);
            return {
                message: 'validation.photo_skiped',
                access_token: issued.token,
                expires_in: issued.expires_in,
                next_step: 'home screen',
            }
        }
    }

    async updateUserProfile(user_id:string, dto:UpdateUserProfileDto){
        const user = await this.userRepository.findOne({ where: { id:user_id } })
        if (!user) throw new NotFoundException({ message: 'validation.user_not_found' });
        user.email = dto.email;
        user.phone_number = dto.phone_number;
        user.full_name = dto.full_name;
        user.date_of_birth = dto.date_of_birth;
        user.gender = dto.gender;
        user.blood_group = dto.blood_group;
        user.emergency_contact = dto.emergency_contact;
        user.address = dto.address?.trim();
        user.is_profile_exists = true;
        user.updated_at = new Date();
        const updatedProfile = await this.userRepository.save(user);
        return {
            message: 'validation.profile_updated',
            updatedProfile,
        };
    }
}
