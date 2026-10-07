import{ IsString, IsNotEmpty,
  MinLength, IsOptional,
   IsDateString, IsNumber,
    MaxLength, Matches,
  IsDefined } from 'class-validator';
import { Transform, Type } from 'class-transformer';

import { i18nValidationMessage } from 'nestjs-i18n';
import { ApiProperty,ApiPropertyOptional } from '@nestjs/swagger';

export class UploadReportsDto {

  @ApiProperty({
    name: 'report_name',
    type: 'string',
    example: 'Blood Test Report',
    description:' name of the report'
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

  @MinLength(2,{
    message: i18nValidationMessage('validation.REPORT_NAME_MIN')
  })
 
  @MaxLength(40,{
    message: i18nValidationMessage('validation.REPORT_NAME_MAX')
  })
  
  @Matches(/[a-zA-Z]/,{
    message: i18nValidationMessage('validation.REPORT_NAME_TEXT')
  })
  report_name: string;


  @ApiProperty({
    name: 'report_type',
    type: 'string',
    example: 'Blood Test Report',
    description:' Type of the report'
  })
   @IsDefined({
    message: i18nValidationMessage('validation.REPORT_TYPE_REQUIRED'),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.REPORT_TYPE_REQUIRED')
  })
  @IsString({
    message: i18nValidationMessage('validation.REPORT_TYPE_STRING')
  })
  @MinLength(2,{
    message: i18nValidationMessage('validation.REPORT_TYPE_MIN')
  })
  @MaxLength(40,{
    message: i18nValidationMessage('validation.REPORT_TYPE_MAX')
  })
  
  @Matches(/[a-zA-Z]/,{
    message: i18nValidationMessage('validation.REPORT_TYPE_TEXT')
  })
  report_type!: string;

  @ApiProperty({
    name:'report_date',
    type:'string',
    example:'2026-07-07'
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.REPORT_DATE_REQUIRED')
  })
  @IsDateString({},{
    message: i18nValidationMessage('validation.REPORT_DATE_INVALID')
  })
  report_date!: string;


  @ApiProperty({
    name: 'Hospital_Or_Diagnostic_Center',
    type: 'string',
    example: 'Apollo Hospitals',
    description:' name of the Hospital Or Diagnostic Center'
  })
  @IsDefined({
    message: i18nValidationMessage('validation.HOSPITAL_REQUIRED'),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.HOSPITAL_REQUIRED'),
  })
  @IsString({
    message: i18nValidationMessage('validation.HOSPITAL_STRING'),
  })
  @MinLength(2, {
    message: i18nValidationMessage('validation.HOSPITAL_MIN'),
  })
  @MaxLength(100, {
    message: i18nValidationMessage('validation.HOSPITAL_MAX'),
  })
  @Matches(/[a-zA-Z]/, {
    message: i18nValidationMessage('validation.HOSPITAL_TEXT'),
  })
  Hospital_Or_Diagnostic_Center!: string;


  @ApiProperty({
    name: 'Doctor_name',
    type: 'string',
    example: 'Dr. Gowriprasad',
    description:' name of the Hospital Or Diagnostic Center'
  })
  @IsDefined({
    message: i18nValidationMessage('validation.DOCTOR_REQUIRED'),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.DOCTOR_REQUIRED'),
  })
  @IsString({
    message: i18nValidationMessage('validation.DOCTOR_STRING'),
  })
  @MinLength(2, {
    message: i18nValidationMessage('validation.DOCTOR_MIN'),
  })
  @MaxLength(60, {
    message: i18nValidationMessage('validation.DOCTOR_MAX'),
  })
  @Matches(/[a-zA-Z]/, {
    message: i18nValidationMessage('validation.DOCTOR_TEXT'),
  })
  Doctor_name!: string;


  @ApiPropertyOptional({
    name: 'tags',
    type: 'string',
    example: 'blood,test,routine',
    description:' name of the Tag'
  })
  @IsOptional()
  @IsString({
    message: i18nValidationMessage('validation.TAGS_STRING'),
  })
  @MinLength(2, {
    message: i18nValidationMessage('validation.TAGS_MIN'),
  })
  @MaxLength(255, {
    message: i18nValidationMessage('validation.TAGS_MAX'),
  })
  @Matches(/[a-zA-Z]/, {
    message: i18nValidationMessage('validation.TAGS_TEXT'),
  })
  tags?: string;

  @ApiPropertyOptional({
    name: 'collection_id',
    type: 'number',
    example: '1',
    description:' Existing collection ID. Use this OR new_collection_name.  '
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  collection_id?: number;


  @ApiPropertyOptional({
    name: 'new_collection_name',
    type: 'string',
    example: 'X-ray',
    description:' New collection name'
  })
  @IsOptional()
  @Transform(({value})=>
    value === ''? undefined: value
  )
  @IsString({
    message: i18nValidationMessage(
      'validation.NEW_COLLECTION_NAME_STRING',
    ),
  })
  @MinLength(2, {
    message: i18nValidationMessage(
      'validation.NEW_COLLECTION_NAME_MIN',
    ),
  })
  @MaxLength(40, {
    message: i18nValidationMessage(
      'validation.NEW_COLLECTION_NAME_MAX',
    ),
  })
  @Matches(/[a-zA-Z]/, {
    message: i18nValidationMessage(
      'validation.NEW_COLLECTION_NAME_TEXT',
    ),
  })
  new_collection_name?: string;

}