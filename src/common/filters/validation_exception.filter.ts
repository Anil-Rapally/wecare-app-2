import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
} from '@nestjs/common';
import { Response } from 'express';
import { I18nValidationException } from 'nestjs-i18n';

@Catch(I18nValidationException)
export class ValidationExceptionFilter implements ExceptionFilter<I18nValidationException> {
  catch(exception: I18nValidationException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus(); 
    const errors = exception.errors ?? [];
    let firstMessage = 'Validation failed';

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
      success: 5,
      message: firstMessage,
      data: null,
    });
  }
}
