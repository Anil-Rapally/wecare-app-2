import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Report } from './entities/reports.entity';

import { Collection } from '../collections/entities/collection.entity';
import { UploadReportsDto } from './DTO/upload.reports.dto';


@Injectable()
export class ReportsService {

    constructor(
        @InjectRepository(Report)
        private readonly reportRepository: Repository<Report>,

        @InjectRepository(Collection)
        private readonly collectionRepository: Repository<Collection>,
    ) {}

    async findAll(page:number, limit:number, search?: string){
        const query = this.reportRepository
        .createQueryBuilder('report')
        .leftJoinAndSelect('report.collection','collection')
        
        if(search){
            query.where(
                'report.report_name LIKE: search OR report.report_type LIKE: search OR report.tags LIKE: search',
                {search: '%search%'}
            )  
        }
        const [ reports, total ]= await query
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();

        const totalpages = Math.ceil(total/limit)
        
        return {
            data: reports,
            total,
            page,
            limit,
            totalpages,
        }
    }

    async saveReport(file: any, dto: UploadReportsDto,): Promise<Report> {

        if (!file) {
            throw new BadRequestException('No file was Uploaded');
        }

        let collection: Collection | null = null;

        if (dto.collection_id) {

            collection = await this.collectionRepository.findOne({
            where: {
                id: dto.collection_id,
            },
        });

            if (!collection) {
            throw new NotFoundException(
                `Collection with ID ${dto.collection_id} does not exist`,
            );
        }
        }
        else if (dto.new_collection_name) {

            collection = await this.collectionRepository.findOne({
            where: {
                name: dto.new_collection_name,
            },
        });

            if (!collection) {
            collection = this.collectionRepository.create({
                name: dto.new_collection_name,
            });

            collection = await this.collectionRepository.save(collection);
            }
        }
        const report = this.reportRepository.create({
            report_name: dto.report_name,
            report_type: dto.report_type,
            report_date: dto.report_date,
            Hospital_Or_Diagnostic_Center:
            dto.Hospital_Or_Diagnostic_Center,
            Doctor_name: dto.Doctor_name,
            tags: dto.tags,

            file_name: file.originalname,
            file_type: file.mimetype,
            file_size: file.size,
            file_data: file.buffer,

            collection: collection ?? undefined,

            
        });
        return await this.reportRepository.save(report);
        
    }
}



