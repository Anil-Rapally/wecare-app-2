import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ReportShare } from '../entity/report-share.entity';
import { Report } from '../entity/reports.entity';
import { Collection } from '../entity/collection.entity';

import { ReportShareController } from './report-share.controller';
import { ReportShareService } from './report-share.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ReportShare,
      Report,
      Collection,
    ]),
  ],
  controllers: [ReportShareController],
  providers: [ReportShareService],
  exports: [ReportShareService],
})
export class ReportShareModule {}