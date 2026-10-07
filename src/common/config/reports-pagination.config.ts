import { PaginateConfig } from "nestjs-paginate";
import { Report } from "src/user/entity/reports.entity";

export const ReportsPaginationConfig: PaginateConfig<Report>= {

    sortableColumns:[
        'id',
        'createdAt',
        'report_name',
    ],

    searchableColumns:[
        'report_name',
        'report_type',
        'tags',
    ],
    
      filterableColumns: {
        tags: true,
        report_date: true,
    },

    defaultSortBy:[
        ['id','DESC',]
    ],

    defaultLimit:10,
    maxLimit:100,

    relations:{
        collection:true,
    },

    select: [
    'id',
    'report_name',
    'report_type',
    'report_date',
    'Hospital_Or_Diagnostic_Center',
    'Doctor_name',
    'tags',
    'file_name',
    'file_type',
    'file_size',
    'createdAt',
    'updatedAt',
  ],

}