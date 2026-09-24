import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Report } from '../entity/reports.entity';

import { Collection } from '../entity/collection.entity';
import { UploadReportsDto } from '../dto/upload.reports.dto';
import { ReportQueryDto } from '../dto/reports.query.dto';

import { ReportsPaginationConfig } from 'src/common/config/reports-pagination.config';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';

import { I18nService } from 'nestjs-i18n';

type MonthlyReport = {
    totalReport: number;
    isAvailable: boolean;
    message?: string;
    data: Report[];
};

@Injectable()
export class ReportsService {

    constructor(
        @InjectRepository(Report)
        private readonly reportRepository: Repository<Report>,

        @InjectRepository(Collection)
        private readonly collectionRepository: Repository<Collection>,
        
        private readonly i18n: I18nService
    
    ) {}

    async findAll(
            query: PaginateQuery,
        ): Promise<Paginated<Report>> {

    return paginate(
            query,
            this.reportRepository,
            ReportsPaginationConfig,
        );
    }

    async getMonthlyCount(year: number, month?: number) {
        const query = this.reportRepository
        .createQueryBuilder('report')
        .where('YEAR(report.report_date) = :year',{year});

        if (month) {
            query.andWhere('MONTH(report.report_date) =:month',{month});

        }
 
        const reports = await query
        .orderBy('report.createdAt', 'ASC')
        .getMany();

        if(month){
            if( reports.length === 0 ){
                return{
                    month,
                    totalReport:0,
                    message: await this.i18n.translate('validation.NO_REPORTS_AVAILABLE'),
                    data:[]
                }
            }

            return {
                month,
                totalReport:reports.length,
                data:reports,
            }
        };

        //  Whole year requested -> Pre-fill keys 1 to 12 .
        const groupedMonths: Record<number,MonthlyReport>={};
        for( let  i = 1; i <= 12; i++){
            groupedMonths[i]={
                totalReport:0, 
                isAvailable:false,
                message: await this.i18n.translate('validation.NO_REPORTS_AVAILABLE'),
                data:[],
            }
        }

        reports.forEach((report => {
            const reportDate = new Date(report.report_date);
            const monthKey = reportDate.getMonth() + 1;

            if(groupedMonths[monthKey].totalReport === 0){
                groupedMonths[monthKey].isAvailable = true;
                delete groupedMonths[monthKey].message;
            }

            groupedMonths[monthKey].data.push(report);
            groupedMonths[monthKey].totalReport++;
        }))

        return {
            year,
            month:groupedMonths,
        };
    }

    async saveReport(
            file: Express.Multer.File,reportData: UploadReportsDto,
    ): Promise<Report> {
    
        if (!file) {
            throw new BadRequestException(
                this.i18n.translate('validation.NO_FILE_UPLOADED')
            );
        }

        let collection: Collection | null = null;

        // if user selected both id and new collection name 
        if (
        reportData.collection_id &&
        reportData.new_collection_name
        ) {
        throw new BadRequestException(
            this.i18n.translate('validation.SELECT_ONE_COLLECTION'),
        );
        }

        if (reportData.collection_id) {

        collection = await this.collectionRepository.findOne({
            where: {
            id: reportData.collection_id,
            },
        });

        if (!collection) {
            throw new NotFoundException(
            this.i18n.translate('validation.COLLECTION_NOT_FOUND'),
            );
        }

        } else if (reportData.new_collection_name) {
            
            const collectionName = reportData.new_collection_name.trim();

        collection = await this.collectionRepository.findOne({
            where: {
            name: collectionName,
            },
        });

        if (!collection) {
            collection = this.collectionRepository.create({
            name: reportData.new_collection_name,
            });

            collection = await this.collectionRepository.save(collection);
        }

        } else {

        // if user havent selected any one of those.
        throw new BadRequestException(
            this.i18n.translate('validation.COLLECTION_REQUIRED'),
        );
        }

        const report = this.reportRepository.create({
            report_name: reportData.report_name,
            report_type: reportData.report_type,
            report_date: reportData.report_date,
            Hospital_Or_Diagnostic_Center:
            reportData.Hospital_Or_Diagnostic_Center,
            Doctor_name: reportData.Doctor_name,
            tags: reportData.tags,

            file_name: file.originalname,
            file_type: file.mimetype,
            file_size: file.size,
            file_data: file.buffer,

            collection,
        });

        return await this.reportRepository.save(report);
    }
}





