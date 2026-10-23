
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Twilio from 'twilio';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly twilioClient: ReturnType<typeof Twilio>;

  constructor(private readonly configService: ConfigService) {
    const accountSid = this.configService.get<string>(
      'TWILIO_ACCOUNT_SID',
    );
    const authToken = this.configService.get<string>(
      'TWILIO_AUTH_TOKEN',
    );

    if (!accountSid || !authToken) {
      throw new Error('Twilio credentials are missing');
    }

    this.twilioClient = Twilio(accountSid, authToken);
  }

  async sendSms(to: string, message: string) {
    const from = this.configService.get<string>(
      'TWILIO_PHONE_NUMBER',
    );

    if (!from) {
      throw new Error('TWILIO_PHONE_NUMBER is missing');
    }

    try {
      const result = await this.twilioClient.messages.create({
        body: message,
        from,
        to,
      });

      return {
        success: true,
        sid: result.sid,
        status: result.status,
        to: result.to,
      };
    } catch (error) {
      this.logger.error(
        'Failed to send SMS',
        error instanceof Error ? error.message : String(error),
      );

      throw new InternalServerErrorException(
        'Failed to send SMS',
      );
    }
  }
}
