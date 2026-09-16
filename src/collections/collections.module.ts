import { Module } from '@nestjs/common';
import { CollectionsService } from './collections.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { CollectionsController } from './collections.controller';
import { Collection } from './entities/collection.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Collection])],
  controllers:[CollectionsController],
  providers: [CollectionsService],
  exports:[CollectionsService]
})
export class CollectionsModule {}
