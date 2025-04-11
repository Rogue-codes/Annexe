import { User } from 'src/user/entities/user.entity';

export class SendOTPEvent {
  constructor(
    public readonly user: User,
    public readonly otp?: string,
  ) {}
}

export class GenerateOTPEvent {
  constructor(public readonly user: User) {}
}

export class SendWelcomeNotificationEvent {
  constructor(public readonly user: User) {}
}
