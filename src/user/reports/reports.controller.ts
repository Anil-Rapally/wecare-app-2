import {
    Body, Controller, FileTypeValidator,
    Get, MaxFileSizeValidator, Param, ParseFilePipe,
    ParseIntPipe, Patch, Post, Query, Res, UploadedFile, UseInterceptors,
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
    @UseInterceptors(FileInterceptor('file'))
    uploadReport(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({
                        maxSize: 1024 * 1024 * 25,
                        message: 'File is too large! Maximum allowed size is 25MB',
                    }),

                    new FileTypeValidator({
                        fileType: '.(jpg|jpeg|png|pdf)',
                        errorMessage:
                            'Invalid file format, only JPG, JPEG, PNG and PDF are allowed',
                    }),
                ],
            }),
        )
        file: Express.Multer.File,

        @Body() body: UploadReportsDto,
    ) {
        return this.reportsService.saveReport(file, body);
    }

    // Download the uploaded report file as an attachment.

    @Get('download/:id')
    @ApiOperation({
        summary: 'Download uploaded report',
        description: 'Download an uploaded medical report.',
    })
    @ApiParam({
        name: 'id',
        type: Number,
        example: 1,
        description: 'Report ID.',
    })
    @ApiResponse({
        status: 200,
        description: 'Report downloaded successfully.',
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid report ID.',
    })
    @ApiResponse({
        status: 404,
        description: 'Report not found.',
    })
    async downloadReportFile(
        @Param('id', ParseIntPipe) id: number,
        @Res() res: Response,
    ) {
        const report = await this.reportsService.findById(id);

        res.setHeader('Content-Type', report.file_type);

        res.setHeader(
            'Content-Disposition',
            `attachment; filename="${encodeURIComponent(report.file_name)}"`,
        );

        res.send(report.file_data);
    }

    // Replace the file attached to an existing medical report.

    @Patch(':id/file')
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
    @UseInterceptors(FileInterceptor('file'))
    replaceReportFile(
        @Param('id', ParseIntPipe) id: number,
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({
                        maxSize: 1024 * 1024 * 25,
                        message: 'File is too large! Maximum allowed size is 25MB',
                    }),
                    new FileTypeValidator({
                        fileType: '.(jpg|jpeg|png|pdf)',
                        errorMessage:
                            'Invalid file format, only JPG, JPEG, PNG and PDF are allowed',
                    }),
                ],
            }),
        )
        file: Express.Multer.File,
    ) {
        return this.reportsService.replaceReportFile(id, file);
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

    // add reports   to Archive 
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


}
