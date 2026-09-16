import{ IsString, IsNotEmpty,MinLength, IsOptional, IsDateString, IsNumber, MaxLength, Matches} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class UploadReportsDto {
  @IsString({
    message: i18nValidationMessage('validation.REPORT_NAME_STRING')
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.REPORT_NAME_REQUIRED')
  })
  @MaxLength(40,{
    message: i18nValidationMessage('validation.REPORT_NAME_MAX')
  })
  @MinLength(2,{
    message: i18nValidationMessage('validation.REPORT_NAME_MIN')
  })
  @Matches(/[a-zA-Z]/,{
    message: i18nValidationMessage('validation.REPORT_NAME_TEXT')
  })
  report_name!: string;

   @IsNotEmpty({
    message: i18nValidationMessage('validation.REPORT_TYPE_REQUIRED')
  })
  @IsString({
    message: i18nValidationMessage('validation.REPORT_TYPE_STRING')
  })
  @MaxLength(40,{
    message: i18nValidationMessage('validation.REPORT_TYPE_MAX')
  })
  @MinLength(2,{
    message: i18nValidationMessage('validation.REPORT_TYPE_MIN')
  })
  @Matches(/[a-zA-Z]/,{
    message: i18nValidationMessage('validation.REPORT_TYPE_TEXT')
  })
  report_type!: string;

  @IsNotEmpty({
    message: i18nValidationMessage('validation.REPORT_DATE_REQUIRED')
  })
  @IsDateString({},{
    message: i18nValidationMessage('validation.REPORT_DATE_INVALID')
  })
  report_date!: string;

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

  @IsOptional()
  @IsNumber()
  collection_id?: number;

  @IsOptional()
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