import { ApiPropertyOptional } from "@nestjs/swagger";
import { CreateUserDto } from "./create_user.dto";
import { IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, ValidateIf } from "class-validator";
import { Transform } from "class-transformer";


export class UpdateUserProfileDto extends CreateUserDto{

      @ApiPropertyOptional({ example: 'user@example.com' })
      @IsEmail({}, { message: 'validation.email_invalid' })
      @Transform(({ value }) => (typeof value === 'string' ? value.toLowerCase().trim() : value))
      @IsNotEmpty({message: 'validation.email_required'})
      email: string;
    
      @ApiPropertyOptional({ example: '+911234567890' })
      @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
      @IsPhoneNumber(undefined, { message: 'validation.valid_phone_number' })
      @IsNotEmpty({message: 'validation.valid_phone_number'})
      phone_number: string;
}