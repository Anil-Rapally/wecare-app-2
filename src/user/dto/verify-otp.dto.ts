import { LoginDto } from "./login.dto";
import { IsNotEmpty, IsUUID, Matches } from "class-validator";

export class VerifyOtpDto extends LoginDto {

    @IsUUID('4')
    otpId!: string;

    @IsNotEmpty()
    @Matches(/^\d{4}$/)
    otp!: string;
}