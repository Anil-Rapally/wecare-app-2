import { Module } from '@nestjs/common';
import * as path from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { validateEnvironment, databaseOptions } from './common/config/config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { I18nModule, I18nJsonLoader, QueryResolver } from 'nestjs-i18n';

import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsModule } from './user/reports/reports.module';
import { CollectionsModule } from './user/collections/collections.module';

@Module({

  imports: [
    
    ConfigModule.forRoot({
       isGlobal: true,
       envFilePath:['.env.local','.env'],
        validate: validateEnvironment 
      }),

    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loader: I18nJsonLoader,
      loaderOptions: {
        path: path.join(__dirname,'common','i18n'),
        watch: true,
      },
      resolvers: [
        new QueryResolver(['lang','1'])
      ],
    }),
    
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
    useFactory: (_config: ConfigService) => databaseOptions(),
    }),

    UserModule,
    ReportsModule,
    CollectionsModule,
  ],

  controllers: [AppController],
  providers: [AppService],

})
export class AppModule { }
