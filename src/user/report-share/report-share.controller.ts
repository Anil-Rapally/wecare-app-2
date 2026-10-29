import {
    Controller,
    ParseIntPipe,
    Post,
    Param,
    Get,
    Req,
    Res,
    StreamableFile
} from '@nestjs/common';

import { ReportShareService } from './report-share.service';

import { ApiOperation, ApiTags } from '@nestjs/swagger';

import {
    serveSignedUrl,
    InjectDisk,
    StorageDisk,
} from '@nestjs/storage';

import type { Request, Response } from 'express';

@ApiTags('Share reports & collections')
@Controller()
export class ReportShareController {
    constructor(
        private readonly reportShareService: ReportShareService,

        @InjectDisk('reports')
        private readonly reportsDisk: StorageDisk,


    ) { }

    @Get('files/reports')
    async serveReport(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        const file = await serveSignedUrl(this.reportsDisk, {
            req,
            res,
        });

        return file;
    }

    @Post('report-share/:reportId')
    @ApiOperation({
        summary: 'Share the report file',
    })
    async createShareLink(
        @Param('reportId', ParseIntPipe) reportId: number,
    ) {
        return this.reportShareService.createShareLink(reportId);
    }
}
