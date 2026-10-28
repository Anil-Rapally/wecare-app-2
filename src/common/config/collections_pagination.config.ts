import { PaginateConfig } from "nestjs-paginate";
import { Collection } from "../../user/entity/collection.entity";

export const CollectionsPaginationConfig: PaginateConfig<Collection> = {

    sortableColumns: ['id', 'name', 'createdAt'],

    searchableColumns: [
        'name'
    ],

    filterableColumns: {
        name: true,
        createdAt: true,
    },

    defaultSortBy: [
        ['id', 'DESC',]
    ],

    defaultLimit: 10,
    maxLimit: 100,

    relations: {
        reports: true,
    },

    select: [
        'id',
        'name',
        'createdAt',
        'updatedAt',
        'is_archived',
    ],
}