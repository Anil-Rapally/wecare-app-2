import { IsOptional, IsString, Matches,
         Min, IsInt, Max, IsEnum,
         IsDateString
        } from "class-validator";
import { Type } from "class-transformer";

import { i18nValidationMessage } from "nestjs-i18n";
import {  ApiPropertyOptional } from "@nestjs/swagger";

export enum ReportSort{
    AZ = 'A-Z',
    NEWEST = 'Newest',
    OLDEST = 'Oldest'
}   

export class ReportQueryDto{
    @ApiPropertyOptional({
        type: Number,
        description: 'Page number',
        example: 1,
    })
    @IsOptional()
    @Type(()=> Number) 
    @Min(1,{
        message: i18nValidationMessage('validation.PAGE_MIN')
    })
    @IsInt({
        message: i18nValidationMessage('validation.PAGE_INTEGER')
    })
    page = 1;


    @ApiPropertyOptional({
        type: Number,
        description: 'Number of reports per page',
        example: 10,
    })
    @IsOptional()
    @Type(()=> Number) 
    @Min(1,{
        message: i18nValidationMessage('validation.LIMIT_MIN')
    })
    @Max(100,{
        message: i18nValidationMessage('validation.LIMIT_MAX')
    })
    @IsInt({
        message: i18nValidationMessage('validation.LIMIT_INTEGER')
    })
    limit = 10;


    @ApiPropertyOptional({
        type: String,
        description: 'Search Report name ',
        example:'blood test',
    })
    @IsOptional()
    @IsString({
        message: i18nValidationMessage('validation.SEARCH_STRING')
    })
    @Matches(/[a-zA-Z]/,{
        message:i18nValidationMessage('validation.SEARCH_TEXT')
    })
    search?: string;


    @ApiPropertyOptional({
        enum: ReportSort,
        description: 'Sort reports ',
    })
    @IsOptional()
    @IsEnum(ReportSort)
    sort?: ReportSort;


    @ApiPropertyOptional({
        type: String,
        description: 'Filter by tags',
        example:'blood test',
    })
    @IsOptional()
    @IsString()
    tags?: string;

    @ApiPropertyOptional({
        type: String,
        description: 'Filter by report date from',
        example:'2023-01-01',
    })
    @IsOptional()
    @IsDateString()
    fromDate?: string;


    @ApiPropertyOptional({
        type: String,
        description: 'Filter by report date to',
        example:'2023-12-31',
    })
    @IsOptional()
    @IsDateString()
    toDate?: string;
}