import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({
  timestamps: true,
})
export class Watchlist extends Document {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Auction',
    required: true,
    index: true,
  })
  auctionId: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  })
  userId: MongooseSchema.Types.ObjectId;
}

export const WatchlistSchema = SchemaFactory.createForClass(Watchlist);
