import {
    BadRequestException,
    Body, Controller, 
    Get, Param, 
    ParseIntPipe, Patch, 
    Post, Query, 
    Res, UploadedFile,
     UseInterceptors,ValidationPipe,
    Delete, Put,
} from '@nestjs/common';

import { ReportsService } from './reports.service';
import { Report } from '../entity/reports.entity';
import { UploadReportsDto } from '../dto/upload.reports.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';

import { Paginate, } from 'nestjs-paginate';
import type { Paginated, PaginateQuery } from 'nestjs-paginate';

import { MonthlyReportQueryDto } from '../dto/monthly.report.query.dto';
import { ReportQueryDto, Sort } from '../dto/reports.query.dto';
import { ApiTags, ApiOperation, ApiExtraModels, ApiResponse, ApiConsumes, ApiBody, getSchemaPath, ApiParam } from '@nestjs/swagger';
import { UpdateReportDto } from '../dto/update.report.dto';
import { AddReportToCollectionsDto } from '../dto/add-report-to-collections.dto';
import { diskStorage } from 'multer';
import { join, extname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { memoryStorage } from 'multer';

const uploadPath = join(process.cwd(), 'uploads/reports');

if (!existsSync(uploadPath)) {
    mkdirSync(uploadPath, { recursive: true });
}

export const storage = diskStorage({
    destination: uploadPath,
    filename: (req, file, callback) => {
        const uniqueName =
            `${Date.now()}-${Math.round(Math.random() * 1e9)}` +
            extname(file.originalname);

        callback(null, uniqueName);
    },
});

@ApiTags('Reports-Feature')
@Controller('reports')
export class ReportsController {

    constructor(private reportsService: ReportsService) { }

// Fetch all reports with pagination, sorting, and filtering.
    @Get()
    @ApiOperation({ summary: 'Get all Reports' })
    @ApiResponse({
        status: 200,
        description: 'Reports retrieved successfully.',
    })
    getReports(
        @Paginate() query: PaginateQuery,
        @Query() reportQueryDto: ReportQueryDto,
    ): Promise<Paginated<Report>> {

        const sort = reportQueryDto.sort;
        if (sort === Sort.AZ) {
            query.sortBy = [['report_name', 'ASC']];
        } else if (sort === Sort.NEWEST) {
            query.sortBy = [['createdAt', 'DESC']];
        } else if (sort === Sort.OLDEST) {
            query.sortBy = [['createdAt', 'ASC']];
        }

        if (reportQueryDto.fromDate) {
            query.filter = {
                ...query.filter,
                report_date: [`$gte:${new Date(reportQueryDto.fromDate).toISOString()}`],
            };
        }

        if (reportQueryDto.toDate) {
            query.filter = {
                ...query.filter,
                report_date: [
                    ...(query.filter?.report_date ?? []),
                    `$lte:${new Date(reportQueryDto.toDate).toISOString()}`,
                ],
            };
        }

        const tags = reportQueryDto.tags?.trim();
        if (tags) {
            query.filter = {
                ...query.filter,
                tags: [`$ilike:%${tags}%`],
            };
        }

        return this.reportsService.findAll(query);
    }

    // Get the count of reports for a specific year and month.
    @Get('monthly-count')
    @ApiOperation({
        summary: 'Get reports by Monthly count',
        description: 'Get reports grouped by months for a specific year, or retrieve reports for a specific month'
    })
    @ApiResponse({
        status: 200,
        description: ' Reports data retrieved succesfully.'
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid year or month'
    })
    async getMonthlyCount(
        @Query() query: MonthlyReportQueryDto,
    ) {
        const year = query.year ?? new Date().getFullYear();

        return this.reportsService.getMonthlyCount(year, query.month)
    }

    //global search for reports and collections.
    @Get('Search')
    @ApiOperation({
        summary:'Get all reports from reports and collections'
    })
    @ApiResponse({
        status:200,
        description:'Report and Collections retrived succesfully'
    })
    async globalSearch(
        @Query('search') query:string,
    ){
        return this.reportsService.globalSearch(query)
    }

// Upload a new report along with its associated collection.
    @ApiExtraModels(UploadReportsDto)
    @Post('Upload')
    @ApiOperation({
        summary: 'Upload medical report',
        description:
            'Upload a medical report and save its details in a selected or newly created collection.',
    })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            allOf: [
                {
                    $ref: getSchemaPath(UploadReportsDto),
                },
                {
                    type: 'object',
                    properties: {
                        file: {
                            type: 'string',
                            format: 'binary',
                            description: 'PDF, JPG, JPEG or PNG file. Maximum size: 25MB.',
                        }
                    },
                    required: ['file'],
                }
            ]
        }
    })
    @ApiResponse({
        status: 201,
        description: 'Report uploaded successfully.',
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid report data or file.',
    })
    @ApiResponse({
        status: 404,
        description: 'Collection not found.',
    })
    @UseInterceptors(FileInterceptor('file', {
        storage:memoryStorage,
        limits: {
            fileSize: 25 * 1024 * 1024,
        },
        fileFilter: (req, file, callback) => {

            const allowedTypes = [
                'application/pdf',
                'image/jpeg',
                'image/png',
            ]
            if (allowedTypes.includes(file.mimetype)) {
                callback(null, true);
            } else {
                callback(
                    new BadRequestException(
                        'Only PDF,JPG,JPEG and PNG files are allowed',
                    ),
                    false,
                )
            }
        }
    }))
    uploadReport(
        @UploadedFile()
        file: Express.Multer.File,

        @Body(new ValidationPipe()) body: UploadReportsDto,
    ) {
        return this.reportsService.saveReport(file, body);
    }

// Replace the file attached to an existing medical report.
    @Put(':id/file')
    @ApiOperation({
        summary: 'Replace report file',
        description: 'Replace the file attached to an existing medical report.',
    })
    @ApiParam({
        name: 'id',
        type: Number,
        example: 1,
        description: 'ID of the report whose file should be replaced',
    })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'PDF, JPG, JPEG or PNG file. Maximum size: 25MB.',
                },
            },
            required: ['file'],
        },
    })
    @ApiResponse({
        status: 200,
        description: 'Report file replaced successfully.',
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid report ID or file.',
    })
    @ApiResponse({
        status: 404,
        description: 'Report not found.',
    })
    @UseInterceptors(FileInterceptor('file', {
        storage,
        limits: {
            fileSize: 25 * 1024 * 1024,
        },
        fileFilter: (req, file, callback) => {
            const allowedTypes = [
                'application/pdf',
                'image/jpeg',
                'image/png',
            ]
            if (allowedTypes.includes(file.mimetype)) {
                callback(null, true);
            } else {
                callback(
                    new BadRequestException(
                        'Only PDF,JPG,JPEG and PNG files are allowed',
                    ),
                    false,
                )
            }
        }
    }))
    replaceReportFile(
        @Param('id', ParseIntPipe) id: number,
        @UploadedFile()
        file: Express.Multer.File,
    ) {
        return this.reportsService.replaceReportFile(id, file);
    }

 
    // Download the uploaded report file as an attachment.

    @Get('download/:id')
    @ApiOperation({
        summary: 'Download uploaded report',
        description: 'Download a report from local storage.',
    })
    @ApiParam({
        name: 'id',
        type: Number,
        example: 1,
        description: 'ID of the report',
    })
    @ApiResponse({
        status: 200,
        description: 'Report downloaded successfully.',
    })
    @ApiResponse({
        status: 404,
        description: 'Report or file not found.',
    })
    async downloadReportFile(
        @Param('id', ParseIntPipe) id: number,
        @Res() res: Response,
    ) {
        const report = await this.reportsService.findById(id);

       if(!report ){
        throw new BadRequestException('File reocrd not found ')
       }

       return res.download(report.file_path,report.file_name);
    }


// Update the details of an existing medical report.
    @Patch(':id')
    @ApiOperation({
        summary: 'Update report details',
        description: 'Update the details of an existing medical report.',
    })
    @ApiParam({
        name: 'id',
        type: Number,
        example: 1,
        description: 'ID of the report to update',
    })
    @ApiResponse({
        status: 200,
        description: 'Report details updated successfully.',
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid report ID or report details.',
    })
    @ApiResponse({
        status: 404,
        description: 'Report not found.',
    })
    async updateReport(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateReportDto: UpdateReportDto
    ) {
        return await this.reportsService.updateReport(id, updateReportDto);
    }


// Add a report to one or more collections.
    @Post(':id/collections')
    @ApiOperation({
        summary: 'Add report to collections',
        description: 'Add a report to one or more collections.',
    })
    @ApiParam({
        name: 'id',
        type: Number,
        example: 1,
        description: 'ID of the report to add to collections',
    })
    @ApiResponse({
        status: 200,
        description: 'Report added to collections successfully.',
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
        @Body() addReportToCollectionsDto: AddReportToCollectionsDto,) {

        return await this.reportsService.addReportToCollections(id, addReportToCollectionsDto.collection_ids);
    }

    // // add reports   to Archive 
    @Patch(':id/archive')
    @ApiOperation({
        summary: 'Archive a report by ID'
    })
    @ApiParam({
        name: 'id',
        type: Number,
        description: 'Report ID'
    })
    @ApiResponse({
        status: 200,
        description: 'Report archived successfully'
    })
    @ApiResponse({
        status: 404, description: 'Report not found'
    })
    async archiveReport(
        @Param('id', ParseIntPipe) id: number,
    ) {
        const report = await this.reportsService.archiveReport(id);

        return {
            data: report,
        };
    }

    // Get details of the report 
    @Get(':id/details')
    @ApiOperation({
        summary: 'Get report details and collections',
    })
    @ApiParam({
        name: 'id',
        type: Number,
        example: 1,
        description: 'ID of the report',
    })
    @ApiResponse({
        status: 200,
        description: 'Report details retrieved successfully.',
    })
    @ApiResponse({
        status: 404,
        description: 'Report not found.',
    })
    async getReportDetails(
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.reportsService.getReportDetails(id);
    }

    
    @Delete(':id')
    @ApiOperation({
        summary:'Delete the existing report'
    })
    @ApiParam({
        name:'id',
        type: Number,
        example:1,
        description:'ID of the report',
    })
    @ApiResponse({
        status:200,
        description: 'Report is deleted'
    })
    @ApiResponse({
        status:404,
        description:'Report not found',
    })
    async deleteReport(
        @Param('id', ParseIntPipe) id: number,
    ){
        return this.reportsService.deleteReport(id);
    }

}
