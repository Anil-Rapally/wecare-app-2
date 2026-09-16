import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsLowercase, IsNotEmpty } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class LoginDto {

    @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
    @IsEmail({}, { message: i18nValidationMessage('validation.EMAIL_INVALID') })
    @IsLowercase({ message: i18nValidationMessage('validation.EMAIL_INVALID') })
    @IsNotEmpty({ message: i18nValidationMessage('validation.EMAIL_REQUIRED') })
    email!: string;
}