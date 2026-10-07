import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

import { I18nValidationException } from 'nestjs-i18n';

@Catch()
export class ResponseExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ResponseExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof I18nValidationException) {
      status = exception.getStatus();

      const errors = exception.errors;

      if (errors.length > 0 && errors[0].constraints) {
        message = Object.values(errors[0].constraints)[0];
      }
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();

      const error = exception.getResponse();

      if (typeof error === 'string') {
        message = error;
      } else if (typeof error === 'object' && error !== null) {
        const errorResponse = error as any;
        message = errorResponse.message || message;
      }
    }

    const errorMessage =
      exception instanceof Error ? exception.message : String(exception);
    const stack = exception instanceof Error ? exception.stack : undefined;

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(`Request failed: ${errorMessage}`, stack);
    } else {
      this.logger.warn(`Request rejected (${status}): ${message}`);
    }

    response.status(status).json({
      statusCode: status,
      message:
        status >= HttpStatus.INTERNAL_SERVER_ERROR
          ? 'Internal server error'
          : message,
    });
  }
}