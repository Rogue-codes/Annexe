import { IsMongoId } from 'class-validator';
export class CreateWatchlistDto {
  @IsMongoId()
  auctionId: string;
}
