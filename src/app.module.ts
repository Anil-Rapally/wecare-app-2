import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { validateEnvironment, databaseOptions } from './common/config/config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { I18nModule, AcceptLanguageResolver, I18nJsonLoader } from 'nestjs-i18n';
import { join } from 'node:path';
import { TypeOrmModule } from '@nestjs/typeorm';

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
        path: join(__dirname, 'common', 'i18n'),
        watch: true,
      },
      resolvers: [
        AcceptLanguageResolver,
      ],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
