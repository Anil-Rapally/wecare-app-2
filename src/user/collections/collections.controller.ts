import { Controller, Get } from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Collections')
@Controller('collections')
export class CollectionsController {

    constructor(private collectionsService: CollectionsService){}

    
    @Get()
    @ApiOperation({ summary: 'Get all Collections' })
     @ApiResponse({
    status: 200,
    description: 'Collections retrieved successfully.',
  })
    getCollections() {
        return this.collectionsService.findAll();
    }

}
