import { Auction } from 'src/aution/entities/aution.entity';

export class HandleAuctionEvent {
  constructor(public readonly auction: Auction) {}
}
