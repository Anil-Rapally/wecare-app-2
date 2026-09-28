import 'reflect-metadata';

import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { I18nValidationPipe } from 'nestjs-i18n';
import { ResponseInterceptor } from './common/interceptors/Response.interceptor';
import { ValidationExceptionFilter } from './common/filters/ValidationException.filter';
import { HttpExceptionFilter } from './common/filters/HttpException.filter';
import { ResponseExceptionFilter } from './common/filters/response.exceptions';
import { ReportsModule } from './user/reports/reports.module';
import { CollectionsModule } from './user/collections/collections.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(
    new I18nValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      stopAtFirstError: false,
    }),
  );

  

  app.useGlobalFilters(
    new ResponseExceptionFilter(),
  );


  app.useGlobalFilters(new HttpExceptionFilter(), new ValidationExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());
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
  SwaggerModule.setup('api/docs/reports', app, docDevA);

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

bootstrap().catch(() => {
  process.exitCode = 1;
});
