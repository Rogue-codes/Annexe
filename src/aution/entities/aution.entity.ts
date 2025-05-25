import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum AUCTION_STATUS {
  NOT_STARTED = 'NOT_STARTED',
  ONGOING = 'ONGOING',
  CLOSED = 'CLOSED',
  CANCELED = 'CANCELED',
}

// Define bid interface to avoid duplication
interface Bid {
  bidOwner: MongooseSchema.Types.ObjectId;
  amount: number;
  createdAt: Date;
}

@Schema({
  timestamps: true,
})
export class Auction extends Document {
  @Prop({
    type: String,
    index: true,
  })
  productName: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  })
  creatorId: MongooseSchema.Types.ObjectId;

  @Prop({
    type: String,
  })
  description: string;

  @Prop({
    type: Date,
    required: true,
    index: true,
    get: (date: Date) => date.toISOString(),
    set: (date: string) => new Date(date),
  })
  startDate: Date;

  @Prop({
    type: Date,
    required: true,
    index: true,
    get: (date: Date) => date.toISOString(),
    set: (date: string) => new Date(date),
  })
  endDate: Date;

  @Prop()
  mainImage: string;

  @Prop({
    required: true,
    type: [String],
  })
  images: string[];

  @Prop({
    type: String,
    enum: AUCTION_STATUS,
    default: AUCTION_STATUS.NOT_STARTED,
    index: true,
  })
  status: AUCTION_STATUS;

  @Prop({
    type: [
      {
        bidOwner: {
          type: MongooseSchema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        amount: { type: Number, required: true },
        createdAt: { type: Date, required: true },
      },
    ],
  })
  bids: Bid[];

  @Prop({
    type: {
      bidOwner: {
        type: MongooseSchema.Types.ObjectId,
        ref: 'User',
      },
      amount: { type: Number },
      createdAt: { type: Date },
    },
  })
  winningBid: Bid;

  @Prop({
    type: Number,
    required: true,
  })
  startingPrice: number;
}

export const AuctionSchema = SchemaFactory.createForClass(Auction);

// Add compound indexes at the schema level instead of using the indexes property
AuctionSchema.index({ startDate: 1, endDate: 1 });
AuctionSchema.index({ status: 1, startDate: 1 });
AuctionSchema.index({ creatorId: 1, status: 1 });

// Add text index for full-text search on product name and description
AuctionSchema.index(
  { productName: 'text', description: 'text' },
  { weights: { productName: 10, description: 5 } },
);
