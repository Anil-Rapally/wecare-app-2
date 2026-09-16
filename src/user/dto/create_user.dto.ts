import { IsNotEmpty, Matches, IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';


export class CreateUserDto {

    @ApiProperty({
        example: "UserName"
    })
    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    @IsNotEmpty({ message: i18nValidationMessage('validation.ENTER_NAME') })
    fullName!: string;

    @ApiProperty({ example: "2000-01-01"})
    @IsNotEmpty({ message: i18nValidationMessage('validation.SELECT_DOB') })
    @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: i18nValidationMessage('validation.VALID_DOB') })
    @IsDateString(
        { strict: true },
        { message: i18nValidationMessage('validation.VALID_DOB') },
    )
    dateOfBirth!: string;

    @ApiProperty({
        example: 'male',
    })
    @IsNotEmpty({ message: i18nValidationMessage('validation.SELECT_GENDER') })
    @Matches(/^(male|female|other)$/, { message: i18nValidationMessage('validarion.VALID_GENDER') })
    gender!: string;

    @ApiProperty({
        example: "O+",
    })
    @IsNotEmpty({ message: i18nValidationMessage('validation.SELECT_BG') })
    @Matches(/^(A|B|AB|O)[+-]$/, { message: i18nValidationMessage('validation.VALID_BG') })
    bloodGroup!: string;


    @IsNotEmpty({ message: i18nValidationMessage('validation.ENTER_EMERGENCY_CONTACT') })
    @Matches(/^\+?[1-9]\d{7,14}$/, { message: i18nValidationMessage('validation.ENTER_VALID_EC') })
    emergencyContact!: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    @ApiPropertyOptional({
        example: 'Hyderabad',
        description: 'User address',
    })
    address?: string;
}