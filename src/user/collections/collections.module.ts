import { Module } from '@nestjs/common';
import { CollectionsService } from './collections.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { CollectionsController } from './collections.controller';
import { Collection } from '../entity/collection.entity';
import { Report } from '../entity/reports.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Collection, Report])],
  controllers:[CollectionsController],
  providers: [CollectionsService],
  exports:[CollectionsService]
})
export class CollectionsModule {}
