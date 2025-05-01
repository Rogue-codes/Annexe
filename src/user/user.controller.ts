import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Res,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { CompleteSignInDto, UpdateUserDto } from './dto/update-user.dto';
import * as lodash from 'lodash';
import {
  ForgotPasswordDto,
  ResendOTPDTO,
  ResetPasswordDto,
} from './dto/resend-otp.dto';
import { VerifyAccountDTO } from './dto/verify-user.dto';
import { UserGuard } from 'src/guards/user-guard';
import { LoginDto } from './dto/login.dto';
import { CompleteSignUpGuard } from 'src/guards/complete-sign-up-guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async create(@Body() createUserDto: CreateUserDto, @Res() res) {
    try {
      const user = await this.userService.createUser(createUserDto);
      return res.status(201).json({
        success: true,
        message: 'user created successfully',
        data: lodash.pick(user, [
          'firstName',
          'lastName',
          'email',
          'eventCategories',
          'role',
          'isVerified',
          'isAdmin',
          'imgUrl',
          'isActive',
          'createdAt',
          'isRegistrationComplete',
          'updatedAt',
        ]),
      });
    } catch (error) {
      console.log(error);
      return res.status(error.status || 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // @Get()
  // findAll() {
  //   return this.userService.findAll();
  // }

  @Post('verify')
  async verifyUser(@Body() verifyAccountDto: VerifyAccountDTO, @Res() res) {
    try {
      const result = await this.userService.verifyAccount(verifyAccountDto);
      return res.status(201).json({
        success: true,
        message: 'user verified successfully',
        data: {
          user: lodash.pick(result.user, [
            'firstName',
            'lastName',
            'email',
            'address',
            'isVerified',
            'isAdmin',
            'imgUrl',
            'isActive',
            'createdAt',
            'updatedAt',
            'isRegistrationComplete',
            'bankDetails',
          ]),
          accessToken: result.accessToken,
        },
      });
    } catch (error) {
      console.log(error);
      return res.status(error.status || 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  @Post('resend-otp')
  async resendOtp(@Body() payload: ResendOTPDTO, @Res() res) {
    const result = await this.userService.resendOtp(payload);
    return res.status(201).json({
      success: true,
      message: result,
    });
  }

  @Post('forgot-password')
  async forgetPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
    @Res() res,
  ) {
    try {
      const result = await this.userService.forgotPassword(forgotPasswordDto);
      return res.status(201).json({
        success: true,
        message: result,
      });
    } catch (error) {
      console.log(error);
      return res.status(error.status || 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  @Patch('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto, @Res() res) {
    try {
      const result = await this.userService.resetPassword(resetPasswordDto);
      return res.status(200).json({
        success: true,
        message: result,
      });
    } catch (error) {
      console.log(error);
      return res.status(error.status || 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @UseGuards(CompleteSignUpGuard)
  @Patch('complete-signup')
  async completeRegistration(
    @Body() completeSignInDto: CompleteSignInDto,
    @Res() res,
    @Req() req,
  ) {
    try {
      const result = await this.userService.completeRegistration(
        req.user,
        completeSignInDto,
      );
      return res.status(200).json({
        success: true,
        message: 'user registration complete',
        data: lodash.pick(result, [
          'firstName',
          'lastName',
          'email',
          'address',
          'isVerified',
          'isAdmin',
          'imgUrl',
          'isActive',
          'createdAt',
          'updatedAt',
          'isRegistrationComplete',
          'bankDetails',
        ]),
      });
    } catch (error) {
      console.log(error);
      return res.status(error.status || 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  @UseGuards(UserGuard)
  @Patch('update')
  async updateUser(
    @Body() updateUserDto: UpdateUserDto,
    @Res() res,
    @Req() req,
  ) {
    try {
      const result = await this.userService.updateUser(
        req.user,
        updateUserDto,
      );
      return res.status(200).json({
        success: true,
        message: 'user modification successful',
        data: lodash.pick(result, [
          'firstName',
          'lastName',
          'email',
          'address',
          'isVerified',
          'isAdmin',
          'imgUrl',
          'isActive',
          'createdAt',
          'updatedAt',
          'isRegistrationComplete',
          'bankDetails',
          'state',
          'country',
        ]),
      });
    } catch (error) {
      console.log(error);
      return res.status(error.status || 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res) {
    try {
      const result = await this.userService.login(loginDto);
      return res.status(200).json({
        success: true,
        message: 'Login succesfull',
        data: lodash.pick(result.user, [
          'firstName',
          'lastName',
          'email',
          'address',
          'isVerified',
          'isAdmin',
          'imgUrl',
          'isActive',
          'createdAt',
          'updatedAt',
          'isRegistrationComplete',
          'bankDetails',
        ]),
        accessToken: result.access_token,
      });
    } catch (error) {
      console.log(error);
      return res.status(error.status || 500).json({
        success: false,
        message: error.message,
      });
    }
  }
}
