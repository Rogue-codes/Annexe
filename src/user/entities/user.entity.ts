import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  timestamps: true,
})
export class User extends Document {
  @Prop({
    type: String,
  })
  firstName: string;

  @Prop({
    type: String,
  })
  lastName: string;

  @Prop({
    required: true,
    unique: true,
    type: String,
  })
  email: string;

  @Prop({
    unique: true,
    type: String,
  })
  phone: string;

  @Prop({
    required: true,
    type: String,
  })
  password: string;

  @Prop({
    type: String,
  })
  address: string;

  @Prop({
    type: String,
    default: 'Nigeria',
  })
  country: string;

  @Prop({
    type: String,
  })
  state: string;

  @Prop({
    type: String,
  })
  city: string;

  @Prop({
    type: String,
    default: null,
  })
  imgUrl: string;

  @Prop({
    type: String,
    default: null,
  })
  recipientCode: string;

  @Prop({
    type: Boolean,
    default: false,
  })
  isVerified: boolean;

  @Prop({
    type: Boolean,
    default: false,
  })
  isActive: boolean;

  @Prop({
    type: Boolean,
    default: false,
  })
  isAdmin: boolean;

  @Prop({
    type: Boolean,
    default: false,
  })
  isRegistrationComplete: boolean;

  @Prop({
    type: [
      {
        accountName: { type: String, required: true },
        accountNumber: { type: String, required: true },
        bank: {
          type: {
            bankName: {
              type: String,
              required: true,
            },
            bankCode: {
              type: String,
              required: true,
            },
          },
          required: true,
        },
      },
    ],
  })
  bankDetails: {
    accountNumber: number;
    accountName: string;
    bank: {
      bankName: string;
      bankCode: number;
    };
  }[];
}

export const UserSchema = SchemaFactory.createForClass(User);
