import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectDisk, StorageDisk } from '@nestjs/storage';
import { ReportShare } from '../entity/report-share.entity';
import { Report } from '../entity/reports.entity';
import { Collection } from '../entity/collection.entity';
import { ShareReportsAndCollections } from '../dto/share_reports_and_collections.dto';


@Injectable()
export class ReportShareService {
    constructor(
        @InjectRepository(ReportShare)
        private readonly reportShareRepository: Repository<ReportShare>,

        @InjectRepository(Report)
        private readonly reportRepository: Repository<Report>,

        @InjectRepository(Collection)
        private readonly collectionRepository: Repository<Collection>,

        @InjectDisk('reports')
        private readonly storageDisk: StorageDisk,
    ) { }


    //   async reportsDisk



    // creates a link 
    async createShareLink(reportId: number) {
        // 1. Find the report
        const report = await this.reportRepository.findOne({
            where: { id: reportId },
        });

        if (!report) {
            throw new NotFoundException('Report not found');
        }

        // 2. Check the file path
        if (!report.file_path) {
            throw new NotFoundException('Report file path not found');
        }

        // 3. Get the filename relative to the storage disk root
        const fileKey = report.file_path.split(/[\\/]/).pop();

        if (!fileKey) {
            throw new NotFoundException('Invalid report file path');
        }

        // 4. Generate a signed URL
        // 24-hour expiry
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        // Generate signed URL valid for 24 hours
        const url = await this.storageDisk.signedUrl(fileKey, {
            expiresIn: '24h',
            disposition: 'inline',
        });
        const share = this.reportShareRepository.create({
            report_id: report.id,
            permission: 'VIEW_ONLY',
            expires_at: expiresAt,
        });

        const savedShare = await this.reportShareRepository.save(share);

        return {
            success: 1,
            message: 'Share link created successfully',
            data: {
                id: savedShare.id,
                reportId: savedShare.report_id,
                permission: savedShare.permission,
                expiresAt: savedShare.expires_at,
                url,
            },
        };

    }

    async extendAccess(dto: ShareReportsAndCollections) {

        const shared_collections = await this.reportShareRepository.findBy({ id: dto.collection_id });
        if (shared_collections.length === 0) {
            throw new NotFoundException({ message: 'validation.SHARED_COLLECTION_NOT_FOUND' });
        }
        const shared_reports = await this.reportShareRepository.findOneBy({ id: dto.report_id });
        if (!shared_reports) {
            throw new NotFoundException({ message: 'validation.SHARED_REPORT_NOT_FOUND' });
        }
        await this.reportShareRepository.update(dto.report_id, { expires_at: dto.extendTo });





    }

    async revokeAccess(dto: ShareReportsAndCollections) {

        if (dto.report_id) {
            await this.reportShareRepository.update(dto.report_id, { expires_at: new Date() });
            return {
                message: 'validation.ACCESS_REVOKED'
            };
        }
        else if (dto.collection_id) {
            await this.reportShareRepository.update(dto.collection_id, { expires_at: new Date() });
            return {
                message: 'validation.ACCESS_REVOKED'
            };
        }
        else {
            throw new BadRequestException({ message: 'validation.SHARED_ID_NOT_FOUND' })
        }
    }

}