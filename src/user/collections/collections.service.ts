import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { Collection } from '../entity/collection.entity';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { CollectionsPaginationConfig } from 'src/common/config/collections_pagination.config';
import { Report } from '../entity/reports.entity';
import { CreateCollectionDto } from '../dto/create_collection.dto';

@Injectable()
export class CollectionsService {
    constructor(
        @InjectRepository(Collection)
        private collectionRepository: Repository<Collection>,
        @InjectRepository(Report)
        private reportRepository: Repository<Report>,
    ) { }


    async findAll(
        query: PaginateQuery,
    ): Promise<Paginated<Collection>> {
        const result = await paginate(
            query,
            this.collectionRepository,
            CollectionsPaginationConfig
        );
        result.data = await Promise.all(
            result.data.map(async (collections) => {
                const fullReport = await this.collectionRepository.findOne({
                    where: { id: collections.id },
                    relations: {
                        reports: true,
                    }
                });
                return {
                    ...collections,
                };
            }),
        );
        return result;
    }

    async onModuleInit() {
        const collection = await this.collectionRepository.findOne({
            where: {
                name: 'MY REPORTS'
            },
        });

        if (!collection) {
            await this.collectionRepository.save(
                this.collectionRepository.create({
                    name: 'MY REPORTS',
                })
            )
        }
    }

    async archiveCollections(ids: number[]) {
        const collection = await this.collectionRepository.findBy({ id: In(ids) });
        if (collection.length === 0) throw new NotFoundException({ message: 'validation.COLLECTION_NOT_FOUND' })
        await this.collectionRepository.update(ids, { is_archived: true });
    }

    async deleteCollections(ids: number[]) {
        const collection = await this.collectionRepository.findBy({ id: In(ids) });
        if (collection.length === 0) throw new NotFoundException({ message: 'validation.COLLECTION_NOT_FOUND' })
        await this.collectionRepository.delete(ids);
    }

    async editCollection(id: number, newname: string) {
        const collection = await this.collectionRepository.findOne({
            where: { id: id }
        });
        if (!collection) throw new NotFoundException({ message: 'validation.COLLECTION_NOT_FOUND' })
        await this.collectionRepository.update(id, { name: newname })
    }

    async removeReportsFromCollection(
        collectionId: number,
        reportIds: number[],) {

        const collection = await this.collectionRepository.findOne({
            where: { id: collectionId },
            relations: {
                reports: true,
            }
        })
        if (!collection) {
            throw new BadRequestException({ message: 'validation.COLLECTION_NOT_FOUND' });
        }
        const reports = await this.reportRepository.findBy({
            id: In(reportIds),
        })
        if (reports.length !== new Set(reportIds).size) {
            throw new BadRequestException({ message: 'validation.INVALID_REPORT' })
        }

        await this.collectionRepository
            .createQueryBuilder()
            .relation(Collection, 'reports')
            .of(collectionId)
            .remove(reportIds);
    }


    async createCollection( dto: CreateCollectionDto) {
        const collectionName = dto.collection_name.trim();
        let collection = await this.collectionRepository.findOne({
            where: {
                name: collectionName,
            },
        });
        if (!collection) {
            collection = this.collectionRepository.create({
                name: collectionName,
            });
            collection = await this.collectionRepository.save(collection);
            return {message:'validation.COLLECTION_CREATED'};
        } 
        if(collection) {
            throw new BadRequestException({message: 'validation.COLLECTION_EXISTS'});
        }else{
            throw new BadRequestException({message: 'validation.COLLECTION_REQUIRED'});
        }
    }
}
