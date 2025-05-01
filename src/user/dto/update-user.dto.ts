import { PartialType } from '@nestjs/mapped-types';
import { IsArray, IsNotEmpty, IsOptional, IsString, Length, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UserDTO } from './user.dto';
export class BankDto {
  @IsString()
  @IsNotEmpty()
  bankCode: string;

  @IsString()
  @IsNotEmpty()
  bankName: string;
}

export class BankDetailsDto {
  @IsString()
  @IsNotEmpty()
  accountName: string;

  @IsString()
  @IsNotEmpty()
  accountNumber: string;

  @ValidateNested()
  @Type(() => BankDto)
  bank: BankDto;
}

export class CompleteSignInDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  @Length(11, 13, {
    message: 'Phone number must be between 11 and 13 characters long',
  })
  phone: string;

  @IsString()
  address: string;

  @IsString()
  state: string;

  @IsString()
  city: string;

  @IsString()
  @IsOptional()
  imgUrl?: string;

  @ValidateNested({ each: true })
  @Type(() => BankDetailsDto)
  @IsArray()
  bankDetails: BankDetailsDto[]
}

export class UpdateUserDto extends PartialType(UserDTO) {}
