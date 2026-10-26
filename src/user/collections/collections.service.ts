import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Collection } from '../entity/collection.entity';

@Injectable()
export class CollectionsService {
    constructor(
        @InjectRepository(Collection)
        private collectionRepository: Repository<Collection>,
    ){}

    findAll(){
        return this.collectionRepository.find();
    }

    async onModuleInit(){
        const collection = await this.collectionRepository.findOne({
            where:{
                name:'MY REPORTS'
            },
        });
        
        if(!collection){
            await this.collectionRepository.save(
                this.collectionRepository.create({
                    name: 'MY REPORTS',
                })
            )
        }
    }
}
