import { IsNotEmpty, IsEnum, IsOptional, IsString, MaxLength, IsPhoneNumber, IsDate, MinDate, MaxDate, IsAlpha } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender, BloodGroup } from '../entity/users.entity';

const getMinAgeLimit = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 200);
    return date;
}

export class CreateUserDto {

    @ApiProperty({ example: "UserName" })
    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    @IsNotEmpty({ message:'validation.enter_name' })
    @IsString({ message: 'validation.name_invalid' })
    @IsAlpha('en-US', { message: 'validation.name_invalid' })
    full_name: string;

    @ApiProperty({ example: "2000-01-01" })
    @IsNotEmpty({ message:'validation.select_dob' })
    @Type(() => Date)
    @IsDate({ message:'validation.valid_dob' })
    @MinDate(getMinAgeLimit(), { message:'validation.valid_dob' })
    @MaxDate(new Date(), { message:'validation.valid_dob' })
    date_of_birth: string;

    @ApiProperty({ example: 'male' })
    @IsNotEmpty({ message: 'validation.select_gender' })
    @IsEnum(Gender, { message: 'validation.select_gender' })
    gender: Gender;

    @ApiProperty({ example: "O+" })
    @IsNotEmpty({ message: 'validation.select_blood_group' })
    @IsEnum(BloodGroup, { message: 'validation.valid_blood_group' })
    blood_group: BloodGroup;

    @ApiProperty({example :"+911234567890"})
    @IsNotEmpty({ message: 'validation.enter_emergency_contact' })
    @IsPhoneNumber(undefined, { message: 'validation.valid_emergency_contact' })
    emergency_contact: string;

    @IsOptional()
    @IsString({ message: 'validation.address_invalid' })
    @MaxLength(500, { message: 'validation.address_too_long' })
    @ApiPropertyOptional({
        example: 'Hyderabad',
        description: 'User address',
    })
    address: string;
}