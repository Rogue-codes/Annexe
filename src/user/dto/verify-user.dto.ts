import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class VerifyAccountDTO {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  otp: string;
}
