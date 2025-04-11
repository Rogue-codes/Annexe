import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateWatchlistDto } from './dto/create-watchlist.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Watchlist } from './entities/watchlist.entity';
import mongoose from 'mongoose';
import { OnEvent } from '@nestjs/event-emitter';
import { EmailService } from 'src/email/email.service';
import { HandleAuctionEvent } from 'src/events/auction.events';
import { Auction } from 'src/aution/entities/aution.entity';

@Injectable()
export class WatchlistService {
  constructor(
    @InjectModel(Watchlist.name)
    private readonly watchlistModel: mongoose.Model<Watchlist>,
    private readonly emailService: EmailService,
  ) {}
  async create(user: any, createWatchlistDto: CreateWatchlistDto) {
    // check if user already has the auction in his watch list
    const existingWatchlist = await this.watchlistModel.findOne({
      userId: user._id,
      auctionId: createWatchlistDto.auctionId,
    });

    if (existingWatchlist) {
      throw new BadRequestException('Auction already in watchlist');
    }
    const newWatchlist = await this.watchlistModel.create({
      ...createWatchlistDto,
      userId: user._id,
    });

    return newWatchlist;
  }

  async findAll(user: any, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const watchlists = await this.watchlistModel
      .find({ userId: user._id })
      .skip(skip)
      .limit(limit);

    const total = await this.watchlistModel.countDocuments({
      userId: user._id,
    });

    return {
      data: watchlists,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(user: any, id: string) {
    const watchlist = await this.watchlistModel.findOne({
      userId: user._id,
      _id: id,
    });

    if (!watchlist) {
      throw new NotFoundException('Watchlist not found');
    }

    return watchlist;
  }

  async remove(user: any, id: string): Promise<string> {
    const watchlist = await this.watchlistModel.findById(id).lean();

    // Check if watchlist exists
    if (!watchlist) {
      throw new NotFoundException('Watchlist not found');
    }

    // Verify ownership
    if (watchlist.userId.toString() !== user._id.toString()) {
      throw new UnauthorizedException(
        'You are not authorized to remove this watchlist',
      );
    }

    // Delete using deleteOne() for better error handling
    const result = await this.watchlistModel.deleteOne({ _id: id });

    // Verify deletion was successful
    if (result.deletedCount === 0) {
      throw new InternalServerErrorException('Failed to remove watchlist');
    }

    return 'Watchlist removed successfully';
  }

  @OnEvent('auction.started')
  async sendEmailToAuctionWatchers(payload: HandleAuctionEvent) {
    const watchers: any = await this.watchlistModel
      .find({
        auctionId: payload.auction,
      })
      .populate('auctionId userId');

    // const watchers_ = watchers.map((watcher) => watcher.userId.email);

    for (const watcher of watchers) {
      // Send email to each watcher
      await this.emailService.sendAuctionStartMail(
        watcher.userId,
        watcher.auctionId,
      );
    }
  }

  @OnEvent('auction.ended')
  async sendAuctionClosedEmail(payload: HandleAuctionEvent) {
    //send email to the winning bidder
    await this.emailService.sendAuctionWinnerMail(payload.auction);

    
    // const watchers: any = await this.watchlistModel
    //   .find({
    //     auctionId: payload.auction,
    //   })
    //   .populate('auctionId userId');

    // // const watchers_ = watchers.map((watcher) => watcher.userId.email);

    // for (const watcher of watchers) {
    //   // Send email to each watcher
    //   await this.emailService.sendAuctionStartMail(
    //     watcher.userId,
    //     watcher.auctionId,
    //   );
    // }
  }
}
