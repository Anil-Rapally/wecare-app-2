import { IsNotEmpty, IsEnum, IsOptional, IsString, MaxLength, IsPhoneNumber, IsDate, MinDate, MaxDate } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender, BloodGroup } from '../entity/user.entity';

const getMinAgeLimit = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 200);
    return date;
}
const getMaxAgeLimit = () => new Date();

export class CreateUserDto {

    @ApiProperty({ example: "UserName" })
    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    @IsNotEmpty({ message: i18nValidationMessage('validation.enter_name') })
    full_name!: string;

    @ApiProperty({ example: "2000-01-01" })
    @IsNotEmpty({ message: i18nValidationMessage('validation.select_dob') })
    @Type(() => Date)
    @IsDate({ message: i18nValidationMessage('validation.valid_dob') })
    @MinDate(getMinAgeLimit(), { message: i18nValidationMessage('validation.valid_dob') })
    @MaxDate(getMaxAgeLimit(), { message: i18nValidationMessage('validation.valid_dob') })
    date_of_birth!: string;

    @ApiProperty({ example: 'male' })
    @IsNotEmpty({ message: i18nValidationMessage('validation.select_gender') })
    @IsEnum(Gender, { message: i18nValidationMessage('validation.select_gender') })
    gender!: string;

    @ApiProperty({ example: "O+" })
    @IsNotEmpty({ message: i18nValidationMessage('validation.select_blood_group') })
    @IsEnum(BloodGroup, { message: i18nValidationMessage('validation.select_blood_group') })
    blood_group!: string;

    @IsNotEmpty({ message: i18nValidationMessage('validation.enter_emergency_contact') })
    @IsPhoneNumber(undefined, { message: i18nValidationMessage('validation.enter_emergency_contact') })
    emergency_contact!: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    @ApiPropertyOptional({
        example: 'Hyderabad',
        description: 'User address',
    })
    address?: string;
}