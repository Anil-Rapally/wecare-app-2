import { Body, Controller, FileTypeValidator,
        Get, MaxFileSizeValidator, Param, ParseFilePipe,
        ParseIntPipe, Post, Query, Res, UploadedFile, UseInterceptors,
       } from '@nestjs/common';

import { ReportsService } from './reports.service';
import { Report } from '../entity/reports.entity';
import { UploadReportsDto } from '../dto/upload.reports.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';

import { Paginate, } from 'nestjs-paginate';
import type { Paginated, PaginateQuery } from 'nestjs-paginate';

import { MonthlyReportQueryDto } from '../dto/monthly.report.query.dto';
import { ReportQueryDto, ReportSort } from '../dto/reports.query.dto';
import { ApiTags, ApiOperation, ApiExtraModels, ApiResponse, ApiConsumes,ApiBody, getSchemaPath, ApiParam } from '@nestjs/swagger';


@ApiTags('Reports-Feature')
@Controller('reports')
export class ReportsController {
    
    constructor(private reportsService: ReportsService) {}

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
        if (sort === ReportSort.AZ) {
            query.sortBy = [['report_name', 'ASC']];
        } else if (sort === ReportSort.NEWEST) {
            query.sortBy = [['createdAt', 'DESC']];
        } else if (sort === ReportSort.OLDEST) {
            query.sortBy = [['createdAt', 'ASC']];
        }

        if(reportQueryDto.fromDate){
            query.filter = {
                ...query.filter,
                report_date: [`$gte:${new Date(reportQueryDto.fromDate).toISOString()}`],
            };
        }

        if(reportQueryDto.toDate){
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
    @ApiOperation({ summary: 'Get reports by Monthly count',
        description:'Get reports grouped by months for a specific year, or retrieve reports for a specific month'
     })
    @ApiResponse({status:200, description:' Reports data retrieved succesfully.'})
    @ApiResponse({status:400, description:'Invalid year or month'})
      
    async getMonthlyCount(
        @Query() query: MonthlyReportQueryDto,
    ){
        const year = query.year ?? new Date().getFullYear();

        return this.reportsService.getMonthlyCount(year,query.month)
    }


// Upload a new report along with its associated collection.
    @ApiExtraModels(UploadReportsDto)
    @Post()
    @ApiOperation({
        summary: 'Upload medical report',
        description:
        'Upload a medical report and save its details in a selected or newly created collection.',
    })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema:{
            allOf:[
                {
                    $ref: getSchemaPath(UploadReportsDto),
                },
                {
                    type:'object',
                    properties: {
                        file:{
                            type:'string',
                            format:'binary',
                            description:'PDF, JPG, JPEG or PNG file. Maximum size: 25MB.',
                        }
                    },
                    required:['file'],
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
    
// View the uploaded report file in the browser.
    @Get('view/:id')
    @ApiOperation({
        summary: 'View uploaded report',
        description: 'Report ID.',
    })
    @ApiParam({
        name: 'id',
        type: Number,
        example: 1,
        description: 'ID of the report to view',
    })
    @ApiResponse({
        status: 200,
        description: 'Report file returned successfully.',
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid report ID.',
    })
    @ApiResponse({
        status: 404,
        description: 'Report not found.',
    })
    async viewReportFile(
        @Param('id', ParseIntPipe) id: number,
        @Res() res: Response,
    ) {
        const report = await this.reportsService.findById(id);

        res.setHeader('Content-Type', report.file_type);

        res.setHeader(
        'Content-Disposition',
        `inline; filename="${encodeURIComponent(report.file_name)}"`,
        );

        res.send(report.file_data);
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

}
