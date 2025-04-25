import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { CompleteSignInDto, UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import {
  GenerateOTPEvent,
  SendOTPEvent,
  SendWelcomeNotificationEvent,
} from 'src/events/signup.event';
import { Otp } from './entities/otp.entity';
import { EmailService } from 'src/email/email.service';
import { VerifyAccountDTO } from './dto/verify-user.dto';
import {
  ForgotPasswordDto,
  ResendOTPDTO,
  ResetPasswordDto,
} from './dto/resend-otp.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { decryptToken, encryptToken } from 'src/helpers';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: mongoose.Model<User>,
    @InjectModel(Otp.name)
    private readonly otpModel: mongoose.Model<Otp>,
    private readonly eventEmitter: EventEmitter2,
    private readonly mailService: EmailService,
    private jwtService: JwtService,
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    //  validate that email is unique
    const alreadyExistingUser = await this.userModel.findOne({
      email: createUserDto.email,
    });

    if (alreadyExistingUser) {
      throw new BadRequestException(
        `user with email ${createUserDto.email} already exists`,
      );
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // create user
    const newUser = await this.userModel.create({
      ...createUserDto,
      password: hashedPassword,
    });

    // generate and send otp to user email
    this.eventEmitter.emit('generateOtp', new GenerateOTPEvent(newUser));

    return newUser;
  }

  private async generateOTP(user: User) {
    try {
      const otp = (Math.floor(Math.random() * 900000) + 100000).toString();
      const token = encryptToken(otp);

      const hashedOTP = await bcrypt.hash(otp, 10);

      // check if an otp already exist
      const existingOtp = await this.otpModel.findOne({ email: user.email });
      if (existingOtp) {
        // delete the otp
        await this.otpModel.findByIdAndDelete(existingOtp._id);
      }
      // Create a new otp entry in the database
      await this.otpModel.create({
        email: user.email,
        otp: hashedOTP,
        expiresIn: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      this.eventEmitter.emit('send_otp', new SendOTPEvent(user, token));

      return `A one-time password has been sent to ${user.email}.`;
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
        throw error; // Rethrow known HTTP exceptions
      } else {
        throw new InternalServerErrorException(
          'Error updating user: ' + error.message,
        );
      }
    }
  }

  async verifyAccount(
    verifyAccountDto: VerifyAccountDTO,
  ): Promise<{ user: User; accessToken: string }> {
    // Find the user by email
    const user = await this.userModel.findOne({
      email: verifyAccountDto.email,
    });

    // Check if user exists
    if (!user) {
      throw new HttpException('User not found', 404);
    }

    if (user.isVerified) {
      throw new HttpException('User already verified', 400);
    }

    try {
      // Confirm OTP
      await this.confirmOtp(verifyAccountDto, user);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException('OTP not found for the user', 404);
      }
      throw error; // For other errors, throw as is.
    }

    // Mark user as verified and active
    user.isVerified = true;
    user.isActive = true;

    const token = await this.genAccessToken(user._id.toString());

    // Save the updated user record
    await user.save();

    // Return success message
    return { user, accessToken: token };
  }

  async confirmOtp(payload: VerifyAccountDTO, user: User): Promise<boolean> {
    const decryptedOtp = decryptToken(payload.otp);
    // Fetch OTP entry from the database using the email
    const otpEntry = await this.otpModel.findOne({ email: payload.email });
    if (!otpEntry) {
      throw new NotFoundException('OTP entry not found for the email');
    }

    // Compare the provided OTP with the stored OTP
    const isOTPMatch = await bcrypt.compare(decryptedOtp, otpEntry.otp);
    if (!isOTPMatch) {
      throw new HttpException('Invalid OTP', 401);
    }

    // Check if OTP has expired
    const now = new Date();
    const expiryDate = new Date(otpEntry.expiresIn);
    if (now > expiryDate) {
      throw new HttpException('OTP has expired', 401);
    }

    // Remove the OTP entry after successful confirmation
    await this.otpModel.findOneAndDelete({ email: payload.email });

    this.eventEmitter.emit(
      'send-welcome-email',
      new SendWelcomeNotificationEvent(user),
    );

    // Return true if everything is valid
    return true;
  }

  async resendOtp(payload: ResendOTPDTO): Promise<string> {
    try {
      const user = await this.userModel.findOne({ email: payload.email });

      if (!user) {
        throw new NotFoundException(
          `user with email: ${payload.email} not found`,
        );
      }

      await this.generateOTP(user as User);
      return `A one-time password has been sent to your email.`;
    } catch (error) {
      console.error('Error resending OTP:', error);

      if (
        error instanceof HttpException ||
        error instanceof NotFoundException
      ) {
        throw error;
      } else {
        throw new InternalServerErrorException('Error: ' + error.message);
      }
    }
  }

  async forgotPassword(payload: ForgotPasswordDto): Promise<string> {
    const user = await this.userModel.findOne({ email: payload.email });
    if (!user) {
      // Return a generic response for security reasons
      return 'If the email exists, a password reset link has been sent';
    }

    if (!user.isActive) {
      throw new ForbiddenException('User is not active');
    }

    // Generate OTP and hash it
    const otp = (Math.floor(Math.random() * 900000) + 100000).toString();
    const hashedOTP = await bcrypt.hash(otp, 10);
    const expiresIn = new Date(Date.now() + 60 * 60 * 1000); // Expires in 1 hour

    // Check if an OTP already exists for this user and update it, otherwise create a new one
    await this.otpModel.findOneAndUpdate(
      { email: payload.email },
      { otp: hashedOTP, expiresIn },
      { new: true, upsert: true },
    );

    // Send password reset email
    this.eventEmitter.emit('forgot_password', new SendOTPEvent(user, otp));

    // Return generic message
    return `A password reset link has been sent to ${user.email}`;
  }

  async resetPassword(payload: ResetPasswordDto) {
    if (payload.password !== payload.confirmPassword) {
      throw new BadRequestException(
        'Password and Confirm password do not match',
      );
    }

    const user = await this.userModel.findOne({
      email: payload.email,
    });

    if (!user) {
      throw new NotFoundException('user not found');
    }

    // verify otp
    const otp = await this.otpModel.findOne({ email: payload.email });
    if (!otp) {
      throw new UnauthorizedException('Invalid OTP');
    }

    // compare otp
    const isValidOtp = await bcrypt.compare(payload.otp, otp.otp);
    if (!isValidOtp) {
      throw new UnauthorizedException('Invalid OTP');
    }

    // Check if OTP has expired
    const now = new Date();
    const expiryDate = new Date(otp.expiresIn);
    if (now > expiryDate) {
      throw new HttpException('OTP has expired', 401);
    }

    // delete otp
    await this.otpModel.deleteOne({ email: payload.email });

    const hashedPassword = await bcrypt.hash(payload.password, 10);

    user.password = hashedPassword;
    await user.save();

    this.eventEmitter.emit('password_reset_success', new SendOTPEvent(user));

    return 'Password reset successfully';
  }

  async updatePassword(
    user_: any,
    payload: UpdatePasswordDto,
  ): Promise<string> {
    if (payload.newPassword !== payload.confirmPassword) {
      throw new BadRequestException(
        'Password and confirm password do not match',
      );
    }

    // Get the user
    const user = await this.userModel.findOne({ _id: user_.id });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validate that old password is correct
    const isValidOldPassword = await bcrypt.compare(
      payload.oldPassword,
      user.password,
    );
    if (!isValidOldPassword) {
      throw new ForbiddenException('Invalid credentials');
    }

    // Ensure account is verified/active if necessary
    if (!user.isVerified || !user.isActive) {
      throw new ForbiddenException('Account not active or verified');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(payload.newPassword, 10);

    // Update user password
    user.password = hashedPassword;
    await user.save();

    this.eventEmitter.emit('password_reset_success', new SendOTPEvent(user));

    return 'Password updated successfully';
  }

  async deactivateAccount(id: string): Promise<User> {
    // Find the user by email
    const user = await this.userModel.findById(id);

    // Check if user exists
    if (!user) {
      throw new HttpException('User not found', 404);
    }

    if (!user.isActive) {
      throw new HttpException('User already inactive', 400);
    }
    user.isActive = false;

    await user.save();

    return user;
  }

  async activateAccount(id: string): Promise<User> {
    // Find the user by email
    const user = await this.userModel.findById(id);

    // Check if user exists
    if (!user) {
      throw new HttpException('User not found', 404);
    }

    if (user.isActive) {
      throw new HttpException('User already active', 400);
    }
    user.isActive = true;

    await user.save();

    return user;
  }

  async genAccessToken(id: string) {
    const token = await this.jwtService.signAsync({ id });
    return token;
  }

  async findOne(id: string) {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException();
    }
    return user;
  }

  async completeRegistration(user: any, updateUserDto: CompleteSignInDto) {
    if (user.isRegistrationComplete) {
      throw new BadRequestException('User has already completed registration');
    }
    const user_ = await this.userModel.findByIdAndUpdate(
      user._id.toString(),
      {
        ...updateUserDto,
        isRegistrationComplete: true,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    return user_;
  }

  async login(loginDto: LoginDto) {
    // Get user
    const user = await this.userModel.findOne({ email: loginDto.email });

    if (!user) {
      throw new NotFoundException('invalid credentials');
    }

    if (!user.isActive) {
      throw new ForbiddenException('user account not active');
    }

    const isPasswordMatch = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Create JWT payload based on user type
    const jwtPayload = {
      id: user._id,
    };

    // Sign and return JWT token
    const access_token = await this.jwtService.signAsync(jwtPayload);

    return {
      user,
      access_token,
    };
  }

  @OnEvent('generateOtp')
  async generateOtp(payload: GenerateOTPEvent) {
    await this.generateOTP(payload.user);
  }

  @OnEvent('password_reset_success')
  async emailNotification(payload: SendOTPEvent) {
    await this.mailService.sendPasswordResetSuccessEmail(payload.user);
  }

  @OnEvent('forgot_password')
  async forgotPasswordEmailNotification(payload: SendOTPEvent) {
    await this.mailService.sendForgotPasswordEmail(payload.user, payload.otp);
  }

  @OnEvent('send_otp')
  async sendOtp(payload: SendOTPEvent) {
    await this.mailService.sendAccountVerificationMail(
      payload.user,
      payload.otp,
    );
  }

  @OnEvent('send-welcome-email')
  async sendWelcomeEmail(payload: SendWelcomeNotificationEvent) {
    await this.mailService.sendWelcomeMail(payload.user);
  }
}
