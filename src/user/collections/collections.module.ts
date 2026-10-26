import { Module } from '@nestjs/common';
import { CollectionsService } from './collections.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { CollectionsController } from './collections.controller';
import { Collection } from '../entity/collection.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Collection])],
  controllers:[CollectionsController],
  providers: [CollectionsService],
  exports:[CollectionsService]
})
export class CollectionsModule {}
