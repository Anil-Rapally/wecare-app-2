import { Module } from '@nestjs/common';
import { AppController } from './app.controller';

import { AppService } from './app.service';

import { ReportsModule } from './reports/reports.module';

import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { CollectionsModule } from './collections/collections.module';

import { Report } from './reports/entities/reports.entity';
import { Collection } from './collections/entities/collection.entity';
import { I18nModule, QueryResolver } from 'nestjs-i18n';

import * as Path from 'path';

@Module({

  imports: [ReportsModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    I18nModule.forRoot({
      fallbackLanguage:'en',
      loaderOptions:{
        path: Path.join(__dirname, '/i18n/'),
        watch:true,
      },
      resolvers:[
        new QueryResolver(['lang','1'])
      ]
    }),

    TypeOrmModule.forRoot({
    type: 'mysql',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    
    synchronize: false,

    entities: [Report, Collection ],
  }),
    CollectionsModule,
  ],

  controllers: [AppController],
  providers: [AppService,],

})
export class AppModule {}

