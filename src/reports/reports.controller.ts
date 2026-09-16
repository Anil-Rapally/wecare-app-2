import { Body, Controller, Get, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';

import { ReportsService } from './reports.service';
import { UploadReportsDto } from './DTO/upload.reports.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Pagination } from './DTO/paginaion.dto';

@Controller('reports')
export class ReportsController {
    
    constructor(private reportsService: ReportsService) {}

    @Get()
    getReports(@Query() Pagination: Pagination){
        return this.reportsService.findAll(
            Pagination.page,
            Pagination.limit,
            Pagination.search
        )
    }
    
    @Post()
    @UseInterceptors(FileInterceptor('file', {
        
        fileFilter: (req,file,callback) =>{
        if (['image/jpeg', 'image/png', 'application/pdf'].includes(file.mimetype)) {
            callback(null, true)
        }else{
            callback(
            new Error('Only jpg|jpeg|png|pdf are allowed'),
            false,
        )}
        }
    }
    ))
    uploadFile(@UploadedFile() file: any, @Body() body:UploadReportsDto) {
    
    return this.reportsService.saveReport(
                    file,
                    {
                        report_name: body.report_name,
                        report_type: body.report_type,
                        report_date: body.report_date,
                        Hospital_Or_Diagnostic_Center: body.Hospital_Or_Diagnostic_Center,
                        Doctor_name: body.Doctor_name,
                        tags: body.tags,
                        collection_id: body.collection_id,
                        new_collection_name: body.new_collection_name,
                    },
    ); 
    }

}


    
