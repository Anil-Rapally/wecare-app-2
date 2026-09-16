import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { I18nValidationExceptionFilter, I18nValidationPipe } from 'nestjs-i18n';

import { ResponseExceptionFilter } from './exceptions/response.exceptions';
import { ResponseInterceptor } from './interceptors/response.interceptors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

   app.useGlobalPipes(
      new I18nValidationPipe({
      transform: true,
      stopAtFirstError: false,
    }),
  );

    app.useGlobalFilters(
        new ResponseExceptionFilter(),
    );

    app.useGlobalInterceptors(
      new ResponseInterceptor(),
    );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
