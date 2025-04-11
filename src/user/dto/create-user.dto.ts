import { IsEmail, IsNotEmpty, Length, Matches } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @Length(6, 20)
  @Matches(/[a-z]/, {
    message: 'Password must contain at least one lowercase character',
  })
  @Matches(/[A-Z]/, {
    message: 'Password must contain at least one uppercase character',
  })
  @Matches(/[0-9]/, { message: 'Password must contain at least one number' })
  @Matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, {
    message: 'Password must contain at least one special character',
  })
  password: string;
}
