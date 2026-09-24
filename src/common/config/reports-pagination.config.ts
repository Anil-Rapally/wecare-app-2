import { PaginateConfig } from "nestjs-paginate";
import { Report } from "src/user/entity/reports.entity";

export const ReportsPaginationConfig: PaginateConfig<Report>= {

    sortableColumns:[
        'report_name',
        'report_type',
        'report_date',
    ],

    searchableColumns:[
        'report_name',
        'report_type',
        'tags',
    ],
    
      filterableColumns: {
        report_type: true,
        report_date: true,
    },

    defaultSortBy:[
        ['createdAt','DESC',]
    ],

    defaultLimit:10,
    maxLimit:100,

    relations:{
        collection:true,
    }

}