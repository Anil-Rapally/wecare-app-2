import { Injectable, BadRequestException, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { EmailService } from 'src/common/email/email.service';
import { Redis } from 'ioredis';
import { randomInt } from 'crypto';


@Injectable()
export class OtpService {

  constructor(
    private readonly mail: EmailService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) { }

  async generateOtp(email: string): Promise<{ message: string; }> {
    if (!email) {
      throw new BadRequestException({message: 'validation.email_invalid'});
    }

    const ttl = 300;
    const existing_user = await this.redis.get(`user_attempts:${email}`);
    if (existing_user) {
      const attempts = parseInt(existing_user);
      if (attempts > 5) {
        throw new HttpException({message: 'validation.too_many_attempts'},
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
      await this.redis.set(`user_attempts:${email}`, (attempts + 1).toString(), 'EX', 3600);


      const resend_otp_attempts = await this.redis.get(`resend_otp_attempts:${email}`);
      if (resend_otp_attempts && parseInt(resend_otp_attempts) > 3) {
        throw new HttpException({message: 'validation.otp_limit_reached'},
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
      await this.redis.set(`resend_otp_attempts:${email}`, (parseInt(resend_otp_attempts || '0') + 1).toString(), 'EX', ttl);


      const resend_otp_after = await this.redis.get(`resend_otp_after:${email}`);
      if (resend_otp_after && parseInt(resend_otp_after) > Date.now()) {
        throw new HttpException({message: 'validation.otp_resend_wait',  messageArgs: { seconds: Math.ceil((parseInt(resend_otp_after) - Date.now()) / 1000) }},
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      const otp = randomInt(0, 10000).toString().padStart(4, '0');
      await this.redis.set(`otp:${email}`, otp, 'EX', ttl);
      await this.mail.sendOtp(email, otp);
      await this.redis.set(`resend_otp_after:${email}`, (Date.now() + 60000).toString(), 'EX', ttl);
      return { message: 'validation.otp_sent_successfully' };
    }

    const otp = randomInt(0, 10000).toString().padStart(4, '0');
    await this.redis.set(`otp:${email}`, otp, 'EX', ttl);
    await this.mail.sendOtp(email, otp);
    await this.redis.set(`user_attempts:${email}`, '1', 'EX', 3600);
    await this.redis.set(`resend_otp_attempts:${email}`, '1', 'EX', ttl);
    await this.redis.set(`resend_otp_after:${email}`, (Date.now() + 60000).toString(), 'EX', ttl);
    return { message: 'validation.otp_sent_successfully' };

  }

  async verifyOtp(email: string, user_otp: string): Promise<{ verified: boolean; message: string; }> {

    const storedOtp = await this.redis.get(`otp:${email}`);
    if (!storedOtp) {
      throw new HttpException({message: 'validation.otp_expired'},
        HttpStatus.BAD_REQUEST,
      );
    }
    if (storedOtp !== user_otp) {
      throw new HttpException({message: 'validation.incorrect_otp'},
        HttpStatus.BAD_REQUEST,
      );
    }
    await this.redis.del(`otp:${email}`);
    return {
      verified: true,
      message: 'validation.otp_verified',
    };
  }
}