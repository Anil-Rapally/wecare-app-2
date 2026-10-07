import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  StreamableFile,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { I18nService } from 'nestjs-i18n';

interface ApiResponse {
  success: number;
  message: string;
  data: unknown;
}

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor(private readonly i18n: I18nService) {}

  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((response) => {
        if (response instanceof StreamableFile) {
          return response;
        }

        const responseObject =
          response !== null && typeof response === 'object' && !Array.isArray(response)
            ? (response as Record<string, unknown>)
            : undefined;
        const messageKey =
          typeof responseObject?.message === 'string'
            ? responseObject.message
            : 'validation.success';
        const messageArgs =
          responseObject?.messageArgs !== null &&
          typeof responseObject?.messageArgs === 'object' &&
          !Array.isArray(responseObject.messageArgs)
            ? (responseObject.messageArgs as Record<string, string | number>)
            : {};
        const data =
          responseObject && Object.prototype.hasOwnProperty.call(responseObject, 'data')
            ? responseObject.data
            : responseObject
              ? Object.fromEntries(
                  Object.entries(responseObject).filter(
                    ([key]) => key !== 'message' && key !== 'messageArgs',
                  ),
                )
              : response;

        return {
          success: 1,
          message: this.i18n.t(messageKey, { args: messageArgs }),
          data,
        } satisfies ApiResponse;
      }),
    );
  }
}
