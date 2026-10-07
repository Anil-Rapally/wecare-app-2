import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
} from '@nestjs/common';
import { Response } from 'express';
import { I18nService, I18nValidationException } from 'nestjs-i18n';

@Catch(I18nValidationException)
export class ValidationExceptionFilter implements ExceptionFilter<I18nValidationException> {
  constructor(private readonly i18n: I18nService) {}

  catch(exception: I18nValidationException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const errors = exception.errors ?? [];
    let firstMessage = this.i18n.t('validation.validation_failed');

    for (const error of errors) {
      if (error.constraints) {
        const messages = Object.values(error.constraints);
        if (messages.length > 0) {
          firstMessage = messages[0];
          break;
        }
      }
    }

    response.status(status).json({
      success: 0,
      message: firstMessage,
      data: null,
    });
  }
}
