import { IsOptional, IsString, Matches } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

export class ReportQueryDto{

    @IsOptional()
    @IsString({
        message: i18nValidationMessage('validation.SEARCH_STRING')
    })
    @Matches(/[a-zA-Z]/,{
        message:i18nValidationMessage('validation.SEARCH_TEXT')
    })
    search!: string;

}