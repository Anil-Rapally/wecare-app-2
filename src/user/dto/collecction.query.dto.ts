import {
    IsOptional, IsString, Matches,
    Min, IsInt, Max,
    IsDateString,
    IsEnum,
    IsNotEmpty,
} from "class-validator";
import { Type } from "class-transformer";

import { i18nValidationMessage } from "nestjs-i18n";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Sort } from "./reports.query.dto";


export class CollectionQueryDto {
    @ApiPropertyOptional({
        type: Number,
        description: 'Page number',
        example: 1,
    })
    @IsNotEmpty()
    @Type(() => Number)
    @Min(1, {
        message: i18nValidationMessage('validation.PAGE_MIN')
    })
    @IsInt({
        message: i18nValidationMessage('validation.PAGE_INTEGER')
    })
    page = 1;


    @ApiPropertyOptional({
        type: Number,
        description: 'Number of collection per page',
        example: 10,
    })
    @IsNotEmpty()
    @Type(() => Number)
    @Min(1, {
        message: i18nValidationMessage('validation.LIMIT_MIN')
    })
    @Max(100, {
        message: i18nValidationMessage('validation.LIMIT_MAX')
    })
    @IsInt({
        message: i18nValidationMessage('validation.LIMIT_INTEGER')
    })
    limit = 10;


    @ApiPropertyOptional({
        type: String,
        description: 'Search collection name ',
        example: 'blood reports',
    })
    @IsOptional()
    @IsString({
        message: i18nValidationMessage('validation.SEARCH_STRING')
    })
    @Matches(/[a-zA-Z]/, {
        message: i18nValidationMessage('validation.SEARCH_TEXT')
    })
    search?: string;

    @ApiPropertyOptional({
        enum: Sort,
        description: 'Sort collections ',
    })
    @IsOptional()
    @IsEnum(Sort)
    sort?: Sort;



    @ApiPropertyOptional({
        type: String,
        description: 'Filter by collection date from',
        example: '2023-01-01',
    })
    @IsOptional()
    @IsDateString()
    fromDate?: string;


    @ApiPropertyOptional({
        type: String,
        description: 'Filter by collection date to',
        example: '2023-12-31',
    })
    @IsOptional()
    @IsDateString()
    toDate?: string;

}