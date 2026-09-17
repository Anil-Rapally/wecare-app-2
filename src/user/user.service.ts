import { Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { UserEntity } from './entity/user.entity';
import { Repository } from 'typeorm';
import { OtpEntity } from './entity/otp.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AuthService } from 'src/common/auth/auth.service';
import { checkOtp, issueOtp } from './otp/otp.service';
import { OtpFailure, OTP_MIN_DELAY_SECONDS, OTP_TTL_SECONDS } from './otp/otp.types';
import { ConfigService } from '@nestjs/config';
import { EmailService } from 'src/common/email/email.service';
import { CreateUserDto } from './dto/create_user.dto';
import { PhotoService } from './photo/photo.service';
import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    HttpException,
    NotFoundException,
    ServiceUnavailableException,
    UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class UserService {
    constructor(

        private readonly dataSource: DataSource,
        @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
        @InjectRepository(OtpEntity) private readonly otpRepository: Repository<OtpEntity>,
        private readonly mail: EmailService,
        private readonly authService: AuthService,
        private readonly config: ConfigService,
        private readonly photos: PhotoService,

    ) { }

    async login(loginDto: LoginDto) {
        const Transaction = await this.dataSource.transaction(async (manager) => {
            const Transaction_user = manager.getRepository(UserEntity)
            const Transaction_otp = manager.getRepository(OtpEntity)

            await Transaction_user.createQueryBuilder()
                .insert().into(UserEntity).values({ email: loginDto.email })
                .orUpdate(['email'], ['email']).execute()

            const user = await Transaction_user.findOneOrFail({
                where: { email: loginDto.email },
                lock: { mode: 'pessimistic_write' },
            });
            const status = (await (Transaction_otp.findOneBy({ userId: user.id })) ?? Transaction_otp.create({ userId: user.id }));
            const result = issueOtp(status, this.config.getOrThrow<string>('OTP_HMAC_SECRET'));
            await Transaction_otp.save(status);
            if (!result.ok) return result;
            return { userId: user.id, email: user.email, otpHash: status.otpHash, ...result };
        });
        if (!Transaction.ok) this.throwOtpFailure(Transaction);
        try {
            await this.mail.sendOtp(Transaction.email, Transaction.otp);
        } catch {

            await this.otpRepository.update(
                { userId: Transaction.userId, otpId: Transaction.otpId, otpHash: Transaction.otpHash, },
                { expiresAt: null },
            );
            throw new ServiceUnavailableException({
                code: 'OTP_SEND_FAILED',
                message: "Failed to send OTP. Please try again later.",
                retryAfter: OTP_MIN_DELAY_SECONDS,
            });
        }

        return {
            message: 'OTP sent to your email.',
            otpId: Transaction.otpId,
            expiresIn: OTP_TTL_SECONDS,
            resendAfter: OTP_MIN_DELAY_SECONDS,
            nextStep: 'verify_otp' as const,
        };
    }

    async verifyOtp(dto: VerifyOtpDto) {
        const result = await this.dataSource.transaction(async (manager) => {
            const users = manager.getRepository(UserEntity);
            const otps = manager.getRepository(OtpEntity);
            const user = await users.findOne({
                where: { email: dto.email },
                lock: { mode: 'pessimistic_write' },
            });
            const invalid: OtpFailure = {
                ok: false,
                status: 401,
                code: 'INVALID_OR_EXPIRED_OTP',
                message: "The code is invalid, expired, or already used.",
            };
            if (!user) return invalid;
            const state = await otps.findOneBy({ userId: user.id });
            if (!state) return invalid;
            const verified = checkOtp(
                state,
                this.config.getOrThrow<string>('OTP_HMAC_SECRET'),
                dto.otpId,
                dto.otp,
            );

            await otps.save(state);
            if (!verified.ok) return verified;
            user.isEmailVerified = true;
            await users.save(user);
            return { ok: true as const, user };
        });
        if (!result.ok) this.throwOtpFailure(result);

        const user = result.user;
        const purpose = user.isProfileExists ? 'access' : 'signup';
        const issued = await this.authService.issue(user.id, purpose);
        const common = {
            isEmailVerified: user.isEmailVerified,
            isProfileExists: user.isProfileExists,
            tokenType: 'Bearer',
            expiresIn: issued.expiresIn,
            user: this.publicUser(user),
        };
        if (user.isProfileExists) {
            return {
                ...common,
                message: "Login successful.",
                nextStep: 'dashboard',
                accessToken: issued.token,
            };
        }
        return {
            ...common,
            message: "Email verified. Complete your profile.",
            nextStep: 'signup',
            signupToken: issued.token,
        };
    }


    async createUser(userId: string, dto: CreateUserDto) {
        const today = new Date().toISOString().slice(0, 10);

        if (dto.dateOfBirth > today) {
            throw new BadRequestException(
                'Date of birth cannot be in the future.',
            );
        }
        const user = await this.dataSource.transaction(async (manager) => {
            const users = manager.getRepository(UserEntity);
            const user = await users.findOne({
                where: { id: userId },
                lock: { mode: 'pessimistic_write' },
            });
            if (!user?.isEmailVerified) throw new UnauthorizedException("Please verify your email first.");
            if (user.isProfileExists) throw new ConflictException("Profile already exists.");
            user.fullName = dto.fullName;
            user.dateOfBirth = dto.dateOfBirth;
            user.gender = dto.gender;
            user.bloodGroup = dto.bloodGroup;
            user.emergencyContact = dto.emergencyContact;
            user.address = dto.address?.trim() ;
            user.isProfileExists = true;
            return users.save(user);
        });
        const issued = await this.authService.issue(user.id, 'access');
        return {
            message: "Profile created successfully.",
            isEmailVerified: user.isEmailVerified,
            isProfileExists: user.isProfileExists,
            accessToken: issued.token,
            tokenType: 'Bearer',
            expiresIn: issued.expiresIn,
            nextStep: 'upload_photo',
            user: this.publicUser(user),
        };
    }

    async uploadProfilePhoto(userId: string, file: Express.Multer.File) {
        const jpeg = await this.photos.sanitize(file.buffer);
        const result = await this.userRepository.update(
            {
                id: userId,
                isEmailVerified: true,
                isProfileExists: true,
            },
            { profilePhoto: jpeg, profilePhotoUrl: '/user/profile-photo' },
        );
        if (!result.affected) throw new ForbiddenException("A completed profile is required.");
        return {
            message: "Profile updated successfully.",
            isEmailVerified: true,
            isProfileExists: true,
            profilePhotoUrl: '/user/profile-photo',
            nextStep: 'dashboard',
        };
    }

    publicUser(user: UserEntity) {
        return {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            dateOfBirth: user.dateOfBirth,
            gender: user.gender,
            bloodGroup: user.bloodGroup,
            emergencyContact: user.emergencyContact,
            address: user.address,
            profilePhotoUrl: user.profilePhotoUrl,
        };
    }


    async getProfilePhoto(userId: string): Promise<Buffer> {
        const user = await this.userRepository
            .createQueryBuilder('user')
            .select('user.id')
            .addSelect('user.profilePhoto')
            .where('user.id = :userId', { userId })
            .getOne();
        if (!user?.profilePhoto) throw new NotFoundException("No profile photo has been uploaded.");
        return user.profilePhoto;
    }

    private throwOtpFailure(failure: OtpFailure): never {
        const { ok: _ok, status, ...body } = failure;
        throw new HttpException(body, status);
    }
}
