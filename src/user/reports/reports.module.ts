import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';


import { Report } from '../entity/reports.entity';
import { Collection } from '../entity/collection.entity';
import { CollectionsModule } from '../collections/collections.module';

@Module({
  imports: [TypeOrmModule.forFeature([Report, Collection]),
   CollectionsModule
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  
})
export class ReportsModule {}
