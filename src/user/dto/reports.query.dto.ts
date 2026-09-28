import { Type } from "class-transformer";
import { IsOptional, IsString, Matches, Min, IsInt, Max, ValidationOptions, registerDecorator } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

export class ReportQueryDto{

    @IsOptional()
    @Type(()=> Number) 
    @Min(1,{
        message: i18nValidationMessage('validation.PAGE_MIN')
    })
    @IsInt({
        message: i18nValidationMessage('validation.PAGE_INTEGER')
    })
    page = 1;


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


    @IsOptional()
    @IsString({
        message: i18nValidationMessage('validation.SEARCH_STRING')
    })
    @Matches(/[a-zA-Z]/,{
        message:i18nValidationMessage('validation.SEARCH_TEXT')
    })
    search!: string;

}