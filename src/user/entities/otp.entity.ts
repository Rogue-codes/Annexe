import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  timestamps: true,
})
export class Otp {
  @Prop({
    required: true,
    type: String,
  })
  otp: string;

  @Prop({
    required: true,
    type: String,
  })
  email: string;

  @Prop({
    required: true,
    type: Date,
  })
  expiresIn: Date;
}

export const OTPSchema = SchemaFactory.createForClass(Otp);
