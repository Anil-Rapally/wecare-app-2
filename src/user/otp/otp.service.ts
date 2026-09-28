import { createHmac, randomInt, randomUUID, timingSafeEqual } from 'node:crypto';
import { Injectable, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OtpEntity } from '../entity/otp.entity';
import * as bcrypt from 'bcrypt';
import { EmailService } from 'src/common/email/email.service';
import { I18nService, i18nValidationMessage } from 'nestjs-i18n';


@Injectable()
export class OtpService {

  constructor(
    @InjectRepository(OtpEntity)
    private readonly otpRepository: Repository<OtpEntity>,
    private readonly mail: EmailService,
    private readonly i18n: I18nService
  ) { }

  async generateOtp(email: string): Promise<{ message: string; expires_at: Date; next_resend_at:Date }> {
    const now = new Date();
    let login_session = await this.otpRepository.findOne({ where: { email } });

    if (login_session && now < login_session.daily_count_reset_at && login_session.daily_resend_count >= 5) {
      throw new HttpException(this.i18n.t('validation.otp_limit_reached'),
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    if (login_session && now < login_session.next_resend_at) {
      const remainingSeconds = Math.ceil((login_session.next_resend_at.getTime() - now.getTime()) / 1000);
      throw new HttpException(
        this.i18n.t('validation.otp_resend_wait', {
          args: {
            remainingSeconds,
          },
        }),
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const raw_otp = Math.floor(1000 + Math.random() * 9000).toString();
    const otp_hash = await bcrypt.hash(raw_otp, 10);
    const expires_at = new Date(now.getTime() + 5 * 60 * 1000);
    const next_resend_at = new Date(now.getTime() + 60 * 1000);

    const daily_count_reset_at = login_session && now < login_session.daily_count_reset_at
      ? login_session.daily_count_reset_at
      : new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const daily_resend_count = login_session && now < login_session.daily_count_reset_at
      ? login_session.daily_resend_count + 1
      : 1;

    if (!login_session) {
      login_session = this.otpRepository.create({
        email, otp_hash, expires_at, next_resend_at, daily_count_reset_at, daily_resend_count
      });
    } else {
      login_session.otp_hash = otp_hash;
      login_session.expires_at = expires_at;
      login_session.next_resend_at = next_resend_at;
      login_session.daily_count_reset_at = daily_count_reset_at;
      login_session.daily_resend_count = daily_resend_count;
      login_session.resend_count += 1;
    }

    await this.otpRepository.save(login_session);

    await this.mail.sendOtp(email, raw_otp);
    return { 
      message: this.i18n.t('validation.otp_sent_successfully') ,
      expires_at,
      next_resend_at,
    };
  }

  async verifyOtp(email: string, user_otp: string): Promise<boolean> {
    const now = new Date();
    const otp_session = await this.otpRepository.findOne({ where: { email } });

    if (!otp_session) {
      throw new BadRequestException(this.i18n.t('validation.no_active_otp'));
    }

    if (now > otp_session.expires_at) {
      throw new BadRequestException(this.i18n.t('validation.otp_expired'));
    }

    const is_match = await bcrypt.compare(user_otp.trim(), otp_session.otp_hash);

    if (!is_match) {
      throw new BadRequestException(this.i18n.t('validation.incorrect_otp'));
    }

    return true;
  }
}
