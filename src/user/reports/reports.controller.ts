import { Body, Controller, FileTypeValidator, Get, MaxFileSizeValidator, ParseFilePipe, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';

import { ReportsService } from './reports.service';
import { Report } from '../entity/reports.entity';
import { UploadReportsDto } from '../dto/upload.reports.dto';
import { FileInterceptor } from '@nestjs/platform-express';

import { Paginate, } from 'nestjs-paginate';
import type { Paginated, PaginateQuery } from 'nestjs-paginate';

import { MonthlyReportQueryDto } from '../dto/monthly.report.query.dto';


@Controller('reports')
export class ReportsController {
    
    constructor(private reportsService: ReportsService) {}

    @Get()
        getReports(
        @Paginate() query: PaginateQuery,
        ): Promise<Paginated<Report>> {
        return this.reportsService.findAll(query, );
    }

    @Get('monthly-count')
      async getMonthlyCount(
        @Query() query: MonthlyReportQueryDto,
    ){
        const year = query.year ?? new Date().getFullYear();

        return this.reportsService.getMonthlyCount(year,query.month)
    }

   @Post()
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

