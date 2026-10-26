import { IsInt, IsOptional, Max, Min } from "class-validator"
import { Type } from "class-transformer"
import { i18nValidationMessage } from "nestjs-i18n";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class MonthlyReportQueryDto {

    @ApiPropertyOptional({
        type:Number,
        example:2026,
        description:' Year to retrieve reports',
    })
    @Type(()=> Number)
    @IsInt({
        message: i18nValidationMessage('validation.YEAR_INTEGER')
    })
    year!: number;

    @ApiPropertyOptional({
        type:Number,
        example:7,
        description:'Month number from 1 to 12.',
    })
    @IsOptional()
    @Type(()=> Number)
    @IsInt({
        message: i18nValidationMessage('validation.MONTH_INTEGER')
    })
    @Min(1,{
        message: i18nValidationMessage('validation.MONTH_MIN')
    })
    @Max(12,{
        message: i18nValidationMessage('validation.MONTH_MAX')
    })
    month?: number


}