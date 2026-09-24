import { IsInt, IsOptional, Max, Min } from "class-validator"
import { Type } from "class-transformer"
import { i18nValidationMessage } from "nestjs-i18n";

export class MonthlyReportQueryDto {

    @Type(()=> Number)
    @IsInt({
        message: i18nValidationMessage('validation.YEAR_INTEGER')
    })
    year!: number;

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