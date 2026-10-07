import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter<HttpException> {
  constructor(private readonly i18n: I18nService) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();
    const responseBody =
      typeof exceptionResponse === 'object' && exceptionResponse !== null
        ? (exceptionResponse as Record<string, unknown>)
        : undefined;
    const rawMessage =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : responseBody?.message;
    const messageArgs =
      responseBody?.messageArgs !== null &&
      typeof responseBody?.messageArgs === 'object' &&
      !Array.isArray(responseBody.messageArgs)
        ? (responseBody.messageArgs as Record<string, string | number>)
        : {};
    const messageKey =
      rawMessage === 'File too large'
        ? 'validation.upload_photo_size'
        : rawMessage === 'File is required'
          ? 'validation.upload_photo_required'
          : rawMessage === 'Too many files'
            ? 'validation.upload_too_many_files'
            : typeof rawMessage === 'string' &&
                /^Unexpected field(?: - .+)?$/.test(rawMessage)
              ? 'validation.upload_unexpected_field'
              : typeof rawMessage === 'string' && rawMessage
                ? rawMessage
                : 'validation.generic_error';

    response.status(status).json({
      success: 0,
      message: this.i18n.t(messageKey, { args: messageArgs }),
      data: null,
    });
  }
}
