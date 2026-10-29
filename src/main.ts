import 'reflect-metadata';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { I18nValidationPipe } from 'nestjs-i18n';
import { ValidationExceptionFilter } from './common/filters/validation_exception.filter';
import { HttpExceptionFilter } from './common/filters/http_exception.filter';
import { I18nService } from 'nestjs-i18n';
import { ResponseExceptionFilter } from './common/filters/response.exceptions';
import { CollectionsModule } from './user/collections/collections.module';
import { ReportsModule } from './user/reports/reports.module';
import * as express from 'express';
import { join } from 'path';
import { ResponseInterceptor } from './common/interceptors/Response.interceptor'

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(
    new I18nValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.use(
  '/uploads',
  express.static(join(process.cwd(), 'uploads')),
);

  app.useGlobalFilters(
    new ResponseExceptionFilter(),
  );

  const i18n = app.get(I18nService);
  app.useGlobalFilters(
    new HttpExceptionFilter(i18n),
    new ValidationExceptionFilter(i18n),
  );
  app.useGlobalInterceptors(app.get(ResponseInterceptor));
  const config = app.get(ConfigService);
  app.use(helmet());
  app.enableCors({ origin: config.getOrThrow<string>('CORS_ORIGIN') });
  app.enableShutdownHooks();

  const Reports = new DocumentBuilder()
    .setTitle('WeCare Reports & Collection ')
    .setDescription('Uploading the reports ')
    .setVersion('1.0')
    .addTag('Reports-Feature')
    .build()

  const docDevA = SwaggerModule.createDocument(app, Reports, {
    include: [ReportsModule, CollectionsModule], // only reports and controller modules 
  });
  const swaggerConfig = new DocumentBuilder()
    .setTitle('WeCare API')
    .setDescription('Authentication, user profile, and profile photo APIs')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'access-token',
    )
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, swaggerDocument);

  await app.listen(Number(config.getOrThrow<string>('PORT')));
}

bootstrap().catch((error) => {
  console.log('Bootstrap error', error);
  process.exitCode = 1;
});