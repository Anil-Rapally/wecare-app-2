import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Report } from '../entity/reports.entity';

import { Collection } from '../entity/collection.entity';
import { UploadReportsDto } from '../dto/upload.reports.dto';
import { UpdateReportDto } from '../dto/update.report.dto';

import { ReportsPaginationConfig } from '../../common/config/reports-pagination.config';
import { paginate, Paginated, PaginateQuery, } from 'nestjs-paginate';

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

    ) { }

    // Fetch all reports with pagination, sorting, and filtering.

    async findAll(
        query: PaginateQuery,
    ): Promise<Paginated<Report>> {


        const result = await paginate(
            query,
            this.reportRepository,
            ReportsPaginationConfig,
        );

        result.data = await Promise.all(
            result.data.map(async (report) => {
                const fullReport = await this.reportRepository.findOne({
                    where: { id: report.id },
                    relations: {
                        collections: true,
                    }
                });
                return {
                    ...report,
                    collections: fullReport?.collections ?? [],
                    download_url: `/reports/download/${report.id}`,
                };
            }),
        );
        return result;
    }

    // Fetch a report by its ID.

    async findById(id: number): Promise<Report> {
        const report = await this.reportRepository.findOne({
            where: { id },
        });

        if (!report) {
            throw new NotFoundException(
                this.i18n.translate('validation.REPORT_NOT_FOUND'),
            );
        }
        return report;
    }

    // Get report details 
    async getReportDetails(id: number) {
        const report = await this.reportRepository.findOne({
            where: { id },
            relations: {
                collections: true,
            },
        });

        if (!report) {
            throw new NotFoundException(
                this.i18n.translate('validation.REPORT_NOT_FOUND'),
            );
        }

        return {
            report_name: report.report_name,
            uploaded_on: report.createdAt,
            hospital: report.Hospital_Or_Diagnostic_Center,
            doctor_name: report.Doctor_name,

            collections: report.collections.map((collection) => ({
                name: collection.name,
                updatedAt: collection.updatedAt,
            })),

            // file_type: report.file_type,
            // file_name: report.file_name,
            file_data: report.file_data.toString('base64'),
        };
    }

    // Get the count of reports for a specific year and month.

    async getMonthlyCount(year: number, month?: number) {
        const query = this.reportRepository
            .createQueryBuilder('report')
            .where('YEAR(report.report_date) = :year', { year });

        if (month) {
            query.andWhere('MONTH(report.report_date) =:month', { month });

        }

        const reports = await query
            .orderBy('report.createdAt', 'ASC')
            .getMany();

        if (month) {
            if (reports.length === 0) {
                return {
                    month,
                    totalReport: 0,
                    message: await this.i18n.translate('validation.NO_REPORTS_AVAILABLE'),
                    data: []
                }
            }

            return {
                month,
                totalReport: reports.length,
                data: reports,
            }
        };

        //  Whole year requested -> Pre-fill keys 1 to 12 .
        const groupedMonths: Record<number, MonthlyReport> = {};
        for (let i = 1; i <= 12; i++) {
            groupedMonths[i] = {
                totalReport: 0,
                isAvailable: false,
                message: await this.i18n.translate('validation.NO_REPORTS_AVAILABLE'),
                data: [],
            }
        }

        reports.forEach((report => {
            const reportDate = new Date(report.report_date);
            const monthKey = reportDate.getMonth() + 1;

            if (groupedMonths[monthKey].totalReport === 0) {
                groupedMonths[monthKey].isAvailable = true;
                delete groupedMonths[monthKey].message;
            }

            groupedMonths[monthKey].data.push(report);
            groupedMonths[monthKey].totalReport++;
        }))

        return {
            year,
            month: groupedMonths,
        };
    }

    // Save a new report along with its associated collection.

    async saveReport(
        file: Express.Multer.File, reportData: UploadReportsDto,
    ): Promise<Omit<Report, 'file_data'>> {

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

            collections: [collection],
        });

        const savedReport = await this.reportRepository.save(report);

        const { file_data, ...reportResonse } = savedReport;
        return reportResonse;
    }

    // Replace the file attached to an existing report.

    async replaceReportFile(
        id: number,
        file: Express.Multer.File,
    ): Promise<Omit<Report, 'file_data'>> {
        if (!file) {
            throw new BadRequestException(
                this.i18n.translate('validation.NO_FILE_UPLOADED'),
            );
        }

        const report = await this.findById(id);
        report.file_data = file.buffer;
        report.file_name = file.originalname;
        report.file_type = file.mimetype;
        report.file_size = file.size;

        const savedReport = await this.reportRepository.save(report);
        const { file_data, ...reportResponse } = savedReport;
        return reportResponse;
    }

    // Update an existing report's details.

    async updateReport(id: number,
        updateReportDto: UpdateReportDto): Promise<Report> {

        const report = await this.findById(id);

        report.report_name = updateReportDto.report_name;
        report.report_type = updateReportDto.report_type;
        report.report_date = updateReportDto.report_date;
        report.Hospital_Or_Diagnostic_Center = updateReportDto.Hospital_Or_Diagnostic_Center;
        report.Doctor_name = updateReportDto.Doctor_name;

        if (updateReportDto.notes !== undefined) {
            report.notes = updateReportDto.notes;
        }

        return await this.reportRepository.save(report);

    }

    // Add a report to one or more collections.

    async addReportToCollections(
        reportId: number,
        collectionIds: number[],) {

        const report = await this.reportRepository.findOne({
            where: { id: reportId },
            relations: {
                collections: true,
            }
        })

        if (!report) {
            throw new BadRequestException(
                this.i18n.translate('validation.REPORT_NOT_FOUND')
            );
        }

        const collections = await this.collectionRepository.findBy({
            id: In(collectionIds),
        })
        if (collections.length !== new Set(collectionIds).size) {
            throw new BadRequestException(
                this.i18n.translate('validation.INVALID_COLLECTION')
            )
        }
        const existingIds = new Set(
            report.collections.map((collection) => collection.id)
        )
        const newCollections = collections.filter(
            (collections) => !existingIds.has(collections.id),
        )
        report.collections = [...report.collections, ...newCollections];

        await this.reportRepository.save(report);

        return {
            message: this.i18n.translate(
                'validation.REPORT_ADDED_TO_COLLECTIONS',
            ),
            report_id: reportId,
            collection_ids: report.collections.map(
                (collection) => collection.id,
            ),
        };
    }

    // Archive a report by its ID.
    async archiveReport(id: number) {
        const report = await this.findById(id);

        report.is_archived = true;

        await this.reportRepository.save(report);

        const { file_data, ...reportData } = report;

        return reportData;
    }

}
