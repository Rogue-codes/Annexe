import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsString, Length } from 'class-validator';

export class CompleteSignInDto extends PartialType(CreateUserDto) {
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
}
export class UpdateUserDto extends PartialType(CreateUserDto) {}
