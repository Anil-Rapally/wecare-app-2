import { Injectable, BadRequestException, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { EmailService } from 'src/common/email/email.service';
import type { Redis } from 'ioredis';
import { randomInt } from 'crypto';


@Injectable()
export class OtpService {

  constructor(
    private readonly mail: EmailService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) { }

  private identifyUser(user_identifier: string): {
    type: 'email' | 'phone';
    identifier: string;
  } {
    user_identifier = user_identifier.trim();
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user_identifier)) {
      return { type: 'email', identifier: user_identifier };
    }
    return { type: 'phone', identifier: user_identifier };
  }

  async generateOtp(user_identifier: string): Promise<{ message: string; }> {
    const otp = randomInt(0, 10000).toString().padStart(4, '0');
    const ttl = 300;
    const { type, identifier } = this.identifyUser(user_identifier);
    //type === 'email' && await this.mail.sendOtp(identifier, otp);
    await this.redis.set(`otp:${identifier}`, otp, 'EX', ttl);
    console.log(otp);
    return { message: 'validation.otp_sent_successfully' };
  }

  async verifyOtp(user_identifier: string, user_otp: string): Promise<{ verified: boolean }> {
    const { identifier } = this.identifyUser(user_identifier);
    const storedOtp = await this.redis.get(`otp:${identifier}`);
    if (!storedOtp) {
      throw new HttpException({ message: 'validation.otp_expired' },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (storedOtp === user_otp) {
      return {
        verified: true
      }
    }
    return {
      verified: false
    }
  }
}