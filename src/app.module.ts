import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { validateEnvironment, databaseOptions } from './common/config/config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { I18nModule, AcceptLanguageResolver, I18nJsonLoader } from 'nestjs-i18n';
import { join } from 'node:path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from './common/redis/redis.module';
import { ResponseInterceptor } from './common/interceptors/Response.interceptor';
import { ReportsModule } from './user/reports/reports.module';
import { CollectionsModule } from './user/collections/collections.module';
import { StorageModule } from '@nestjs/storage';
import { createStorageOptions } from './storage/storage.config';
import { ReportShareModule } from './user/report-share/report-share.modules';

@Module({
  imports: [UserModule,
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnvironment }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (_config: ConfigService) => databaseOptions(),
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loader: I18nJsonLoader,
      loaderOptions: {
        path: join(process.cwd(), 'src', 'common', 'i18n'),
        watch: false,
      },
      resolvers: [
        AcceptLanguageResolver,
      ],
    }),

    StorageModule.forRootAsync({
      inject: [ConfigService],
      useFactory:(config:ConfigService)=> createStorageOptions(config),
    }),
    RedisModule,
    ReportsModule,
    CollectionsModule,
    ReportShareModule,
  ],
  controllers: [AppController],
  providers: [AppService, ResponseInterceptor],
})
export class AppModule { }  