import { IsString, IsEmail, IsOptional, IsBoolean, IsArray, ValidateNested, IsNotEmpty, Matches, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

class BankDTO {
  @IsString()
  @IsNotEmpty()
  bankName: string;

  @IsString()
  @IsNotEmpty()
  bankCode: string;
}

class BankDetailsDTO {
  @IsString()
  @IsNotEmpty()
  accountName: string;

  @IsString()
  @IsNotEmpty()
  accountNumber: string;

  @ValidateNested()
  @Type(() => BankDTO)
  bank: BankDTO;
}

export class UserDTO {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  @Matches(/^\+?[0-9]{10,15}$/, { message: 'Phone number must be valid' })
  phone?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  imgUrl?: string;

  @IsString()
  @IsOptional()
  recipientCode?: string;

  @IsBoolean()
  @IsOptional()
  isVerified?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isAdmin?: boolean;

  @IsBoolean()
  @IsOptional()
  isRegistrationComplete?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BankDetailsDTO)
  @IsOptional()
  bankDetails?: BankDetailsDTO[];
}

export class UpdateUserDTO {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\+?[0-9]{10,15}$/, { message: 'Phone number must be valid' })
  phone?: string;
  
  @IsString()
  @IsOptional()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  imgUrl?: string;

  @IsString()
  @IsOptional()
  recipientCode?: string;

  @IsBoolean()
  @IsOptional()
  isVerified?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isAdmin?: boolean;

  @IsBoolean()
  @IsOptional()
  isRegistrationComplete?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BankDetailsDTO)
  @IsOptional()
  bankDetails?: BankDetailsDTO[];
}