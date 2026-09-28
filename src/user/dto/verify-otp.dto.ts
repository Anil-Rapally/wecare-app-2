import { LoginDto } from "./login.dto";
import { IsNotEmpty, IsUUID, Matches } from "class-validator";

export class VerifyOtpDto extends LoginDto {

    @IsNotEmpty()
    @Matches(/^\d{4}$/)
    otp!: string;
}