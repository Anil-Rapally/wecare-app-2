import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsLowercase, IsNotEmpty } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { Transform } from 'class-transformer';

export class LoginDto {

    @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
    @IsEmail({}, { message: i18nValidationMessage('validation.email_required') })
    @Transform(({ value }) => (typeof value === 'string' ? value.toLowerCase().trim() : value))
    @IsNotEmpty({ message: i18nValidationMessage('validation.email_required') })
    email!: string;
}