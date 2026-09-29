import { Body, Controller, FileTypeValidator,
        Get, MaxFileSizeValidator, ParseFilePipe,
        Post, Query, UploadedFile, UseInterceptors,
       } from '@nestjs/common';

import { ReportsService } from './reports.service';
import { Report } from '../entity/reports.entity';
import { UploadReportsDto } from '../dto/upload.reports.dto';
import { FileInterceptor } from '@nestjs/platform-express';

import { Paginate, } from 'nestjs-paginate';
import type { Paginated, PaginateQuery } from 'nestjs-paginate';

import { MonthlyReportQueryDto } from '../dto/monthly.report.query.dto';
import { ReportQueryDto } from '../dto/reports.query.dto';
import { ApiTags, ApiOperation, ApiExtraModels, ApiResponse, ApiConsumes,ApiBody, getSchemaPath } from '@nestjs/swagger';

@ApiTags('Reports-Feature')
@Controller('reports')
export class ReportsController {
    
    constructor(private reportsService: ReportsService) {}

    @Get()

    @ApiOperation({ summary: 'Get all Reports' })
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
    @ApiConsumes('m')
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

