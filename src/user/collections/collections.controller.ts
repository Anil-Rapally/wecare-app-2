import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Query } from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { Collection } from '../entity/collection.entity';
import { CollectionQueryDto } from '../dto/collecction.query.dto';
import { Paginate, } from 'nestjs-paginate';
import type { Paginated, PaginateQuery } from 'nestjs-paginate';
import { RenameCollectionDto } from '../dto/rename_collections.dto';
import { EditCollectionsDto } from '../dto/edit_collections.dto';
import { Sort } from '../dto/reports.query.dto';
import { RemoveReportsFromCollectionDto } from '../dto/remove_reports_from_collection.dto';

@ApiTags('Collections')
@Controller('collections')
export class CollectionsController {

    constructor(private collectionsService: CollectionsService,
    ) { }


    //paginated api to get all the collections with sorting and filtering
    @Get()
    @ApiOperation({ summary: 'Get all Collections' })
    @ApiResponse({
        status: 200,
        description: 'Collections retrieved successfully.',
    })
    getCollections(
        @Paginate() query: PaginateQuery,
        @Query() collectionQueryDto: CollectionQueryDto,
    ): Promise<Paginated<Collection>> {

        const sort = collectionQueryDto.sort;
        if (sort === Sort.AZ) {
            query.sortBy = [['name', 'ASC']];
        } else if (sort === Sort.NEWEST) {
            query.sortBy = [['createdAt', 'DESC']];
        } else if (sort === Sort.OLDEST) {
            query.sortBy = [['createdAt', 'ASC']];
        }

        if (collectionQueryDto.fromDate) {
            query.filter = {
                ...query.filter,
                createdAt: [`$gte:${new Date(collectionQueryDto.fromDate).toISOString()}`],
            };
        }

        if (collectionQueryDto.toDate) {
            query.filter = {
                ...query.filter,
                createdAt: [
                    ...(query.filter?.createdAt ?? []),
                    `$lte:${new Date(collectionQueryDto.toDate).toISOString()}`,
                ],
            };
        }

        const search = collectionQueryDto.search?.trim();
        if (search) {
            query.filter = {
                ...query.filter,
                name: [`$ilike:%${search}%`],
            };
        }
        return this.collectionsService.findAll(query);
    }

    // archive collections by ids
    @Patch('archive')
    @ApiOperation({
        summary: 'Archive a Collections by ID'
    })
    @ApiResponse({
        status: 200,
        description: 'Collections archived successfully'
    })
    @ApiResponse({
        status: 404, description: 'Collections not found'
    })
    @HttpCode(HttpStatus.OK)
    async archiveCollection(@Body() dto: EditCollectionsDto): Promise<{ message: string }> {
        await this.collectionsService.archiveCollections(dto.ids);
        return { message: `${dto.ids.length} collection archived successfully.` };
    }

    // delete collections by id
    @Delete('delete')
    @ApiOperation({
        summary: 'Delete a Collections by ID'
    })
    @ApiResponse({
        status: 200,
        description: 'Collections deleted successfully'
    })
    @ApiResponse({
        status: 404, description: 'Collections not found'
    })
    @HttpCode(HttpStatus.OK)
    async deleteCollection(@Body() dto: EditCollectionsDto): Promise<{ message: string }> {
        await this.collectionsService.deleteCollections(dto.ids);
        return { message: `${dto.ids.length} items deleted successfully.` };
    }

    //rename collections by id
    @Patch('rename')
    @ApiOperation({
        summary: 'Rename a Collection by ID'
    })
    @ApiResponse({
        status: 200,
        description: 'Collection renamed successfully'
    })
    @ApiResponse({
        status: 404, description: 'Collection not found'
    })
    @HttpCode(HttpStatus.OK)
    async editCollections(@Body() dto: RenameCollectionDto): Promise<{ message: string }> {
        await this.collectionsService.editCollection(dto.id, dto.newname);
        return { message: `renamed successfully.` };
    }

    // Remove one or more repoets from collections

    @Delete(':id/reports')
    @ApiOperation({
        summary: 'remove reports from collections',
        description: 'Remove one or more repoets from collections',
    })
    @ApiResponse({
        status: 200,
        description: 'Report removed from collections successfully.',
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid report ID or collection IDs.',
    })
    @ApiResponse({
        status: 404,
        description: 'Report or collections not found.',
    })
    async addToCollections(
        @Param('id', ParseIntPipe) id: number,
        @Body() removeReportsFromCollectionDto: RemoveReportsFromCollectionDto,) {

        return await this.collectionsService.removeReportsFromCollection(id, removeReportsFromCollectionDto.report_ids);
    }

}

