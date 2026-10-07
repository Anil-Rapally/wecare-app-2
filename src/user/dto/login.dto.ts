import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class LoginDto {

  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @IsEmail({}, { message: 'validation.email_invalid' })
  @Transform(({ value }) => (typeof value === 'string' ? value.toLowerCase().trim() : value))
  @IsNotEmpty({ message: 'validation.email_required' })
  email: string;

   @ApiPropertyOptional({
    example: '4821',
    description:
      '4-digit OTP. If omitted, a new OTP is generated and sent. If provided, the OTP is verified.',
  })
  @IsOptional()
  @Matches(/^\d{4}$/, { message: 'validation.otp_invalid' })
  otp: string;
}