import { ApiProperty } from "@nestjs/swagger";
import {
    IsDefined,
    IsNotEmpty,
    IsString,
    MinLength,
    MaxLength,
    Matches,
    IsDateString,
    IsOptional
} from "class-validator";

import { i18nValidationMessage } from "nestjs-i18n";

export class UpdateReportDto {

    @ApiProperty({
        name: 'report_name',
        type: 'string',
        example: 'Blood Test Report',
        description: ' name of the report'
    })
    @IsDefined({
        message: i18nValidationMessage('validation.REPORT_NAME_REQUIRED'),
    })
    @IsNotEmpty({
        message: i18nValidationMessage('validation.REPORT_NAME_REQUIRED')
    })
    @IsString({
        message: i18nValidationMessage('validation.REPORT_NAME_STRING')
    })
    @MinLength(2, {
        message: i18nValidationMessage('validation.REPORT_NAME_MIN')
    })
    @MaxLength(40, {
        message: i18nValidationMessage('validation.REPORT_NAME_MAX')
    })
    @Matches(/[a-zA-Z]/, {
        message: i18nValidationMessage('validation.REPORT_NAME_TEXT')
    })
    report_name: string;

    @ApiProperty({
        name: 'report_type',
        type: 'string',
        example: 'Blood Test Report',
        description: ' Type of the report'
    })
    @IsDefined({
        message: i18nValidationMessage('validation.REPORT_TYPE_REQUIRED')
    })
    @IsNotEmpty({
        message: i18nValidationMessage('validation.REPORT_TYPE_REQUIRED')
    })
    @IsString({
        message: i18nValidationMessage('validation.REPORT_TYPE_STRING')
    })
    @MinLength(2, {
        message: i18nValidationMessage('validation.REPORT_TYPE_MIN')
    })
    @MaxLength(40, {
        message: i18nValidationMessage('validation.REPORT_TYPE_MAX')
    })
    @Matches(/[a-zA-Z]/, {
        message: i18nValidationMessage('validation.REPORT_TYPE_TEXT')
    })
    report_type: string;

    @ApiProperty({
        name: 'report_date',
        type: 'string',
        example: '2023-08-15',
        description: ' Date of the report in YYYY-MM-DD format'
    })
    @IsDefined({
        message: i18nValidationMessage('validation.REPORT_DATE_REQUIRED')
    })
    @IsNotEmpty({
        message: i18nValidationMessage('validation.REPORT_DATE_REQUIRED')
    })
    @IsDateString({}, {
        message: i18nValidationMessage('validation.REPORT_DATE_INVALID')
    })
    report_date: Date;

    @ApiProperty({
        name: 'Hospital_Or_Diagnostic_Center',
        type: 'string',
        example: 'Apollo Hospitals',
        description: ' name of the Hospital Or Diagnostic Center'
    })
    @IsDefined({
        message: i18nValidationMessage('validation.HOSPITAL_REQUIRED')
    })
    @IsNotEmpty({
        message: i18nValidationMessage('validation.HOSPITAL_REQUIRED')
    })
    @IsString({
        message: i18nValidationMessage('validation.HOSPITAL_STRING')
    })
    @MinLength(2, {
        message: i18nValidationMessage('validation.HOSPITAL_MIN')
    })
    @MaxLength(100, {
        message: i18nValidationMessage('validation.HOSPITAL_MAX')
    })
    @Matches(/[a-zA-Z]/,{
            message: i18nValidationMessage('validation.HOSPITAL_TEXT'),
    })
    Hospital_Or_Diagnostic_Center: string;

    @ApiProperty({
        name: 'Doctor_name',
        type: 'string',
        example: 'Dr. John Doe',
        description: ' name of the Doctor'
    })
    @IsDefined({
        message: i18nValidationMessage('validation.DOCTOR_REQUIRED')
    })
    @IsNotEmpty({
        message: i18nValidationMessage('validation.DOCTOR_REQUIRED')
    })
    @IsString({
        message: i18nValidationMessage('validation.DOCTOR_STRING')
    })
    @MinLength(2, {
        message: i18nValidationMessage('validation.DOCTOR_MIN')
    })
    @MaxLength(100, {
        message: i18nValidationMessage('validation.DOCTOR_MAX')
    })
    @Matches(/[a-zA-Z]/,{
        message:i18nValidationMessage('validation.DOCTOR_TEXT'),
    })
    Doctor_name: string;

    @ApiProperty({
        name: 'notes',
        type: 'string',
        example: 'Follow up required.',
        description: 'Recomanded dietary adjustments and follow-up tests.'
    })
    @IsOptional()
    @IsString({
        message: i18nValidationMessage('validation.NOTES_STRING')
    })
    @MaxLength(500, {
        message: i18nValidationMessage('validation.NOTES_MAX')
    })
    notes?: string;

}