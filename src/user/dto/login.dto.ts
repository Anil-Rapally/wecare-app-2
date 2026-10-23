import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsPhoneNumber, Matches, ValidateIf } from 'class-validator';
import { Transform } from 'class-transformer';

export class LoginDto {

  @ApiPropertyOptional({ example: 'user@example.com' })
  @ValidateIf((o) => !o.phone_number)
  @IsEmail({}, { message: 'validation.email_invalid' })
  @Transform(({ value }) => (typeof value === 'string' ? value.toLowerCase().trim() : value))
  email?: string;

  @ApiPropertyOptional({ example: '+911234567890' })
  @ValidateIf((o) => !o.email)
  @Transform(({ value }) => (typeof value === 'string' ? value.toLowerCase().trim() : value))
  @IsPhoneNumber(undefined, { message: 'validation.valid_phone_number' })
  phone_number?: string;

  @ApiPropertyOptional({
    example: '4821',
    description:
      '4-digit OTP. If omitted, a new OTP is generated and sent. If provided, the OTP is verified.',
  })
  @IsOptional()
  @Matches(/^\d{4}$/, { message: 'validation.otp_invalid' })
  otp: string;
}