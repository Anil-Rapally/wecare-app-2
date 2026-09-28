import { Body, Controller, FileTypeValidator, Get, MaxFileSizeValidator, ParseFilePipe, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';

import { ReportsService } from './reports.service';
import { Report } from '../entity/reports.entity';
import { UploadReportsDto } from '../dto/upload.reports.dto';
import { FileInterceptor } from '@nestjs/platform-express';

import { Paginate, } from 'nestjs-paginate';
import type { Paginated, PaginateQuery } from 'nestjs-paginate';

import { MonthlyReportQueryDto } from '../dto/monthly.report.query.dto';
import { ReportQueryDto } from '../dto/reports.query.dto';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse, ApiConsumes,ApiBody } from '@nestjs/swagger';

@ApiTags('Reports-Feature')
@Controller('reports')
export class ReportsController {
    
    constructor(private reportsService: ReportsService) {}
    @Get()
    @ApiOperation({ summary: 'Get all Reports' })
    @ApiQuery({
        name: 'page',
        required: false,
        type: Number,
        description: 'Page number',
        example: 1,
    })
    @ApiQuery({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Number of reports per page',
        example: 10,
    })
    @ApiQuery({
        name: 'search',
        required: false,
        type: String,
        description: 'Search Report name ',
        example:'blood test',
    })
    @ApiResponse({
        status: 200,
        description: 'Reports retrieved successfully.',
    })
    getReports(
    @Paginate() query: PaginateQuery,
    @Query() reportQuery: ReportQueryDto,
    ): Promise<Paginated<Report>> {
    return this.reportsService.findAll(query, );
    }

    @Get('monthly-count')
    @ApiOperation({ summary: 'Get reports by Monthly count',
        description:'Get reports groupled by month for a specific year, or retrieve reports for a specific month'
     })
    @ApiQuery({
        name:'year',
        required:false,
        type:Number,
        example:2026,
        description:' Year to retrieve reports',
    })
    @ApiQuery({
        name:'month',
        required:false,
        type:Number,
        example:7,
        description:'Month number from 1 to 12',
    })
    @ApiResponse({status:200, description:' Reports data retrieved succesfully.'})
    @ApiResponse({status:400, description:'Invalid year or month'})
        @ApiResponse({ status: 200, description: 'Reports found.' })
      async getMonthlyCount(
        @Query() query: MonthlyReportQueryDto,
    ){
        const year = query.year ?? new Date().getFullYear();

        return this.reportsService.getMonthlyCount(year,query.month)
    }

   @Post()
   @ApiOperation({
    summary: 'Upload medical report',
    description:
        'Upload a medical report and save its details in a selected or newly created collection.',
    })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
    schema: {
        type: 'object',
        properties: {
        file: {
            type: 'string',
            format: 'binary',
            description: 'Medical report file. JPG, JPEG, PNG or PDF. Maximum 25MB.',
        },

        report_name: {
            type: 'string',
            example: 'Blood Test Report',
        },

        report_type: {
            type: 'string',
            example: 'Blood Test',
        },

        report_date: {
            type: 'string',
            format: 'date',
            example: '2026-07-07',
        },

        Hospital_Or_Diagnostic_Center: {
            type: 'string',
            example: 'Apollo Hospitals',
        },

        Doctor_name: {
            type: 'string',
            example: 'Dr. Ravi Kumar',
        },

        tags: {
            type: 'string',
            example: 'blood,test,routine',
        },

        collection_id: {
            type: 'number',
            example: 1,
            description:
            'Existing collection ID. Use this OR new_collection_name.',
        },

        new_collection_name: {
            type: 'string',
            example: 'Health Reports',
            description:
            'Create a new collection. Use this OR collection_id.',
        },
        },

        required: [
        'file',
        'report_name',
        'report_type',
        'report_date',
        'Hospital_Or_Diagnostic_Center',
        'Doctor_name',
        ],
    },
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

}

