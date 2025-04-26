import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UpdateAutionDto } from './dto/update-aution.dto';
import { BidDto, CreateAuctionDto } from './dto/create-aution.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Auction, AUCTION_STATUS } from './entities/aution.entity';
import mongoose from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron } from '@nestjs/schedule';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { RedisService } from 'src/redis/redis.service';
import { HandleAuctionEvent } from 'src/events/auction.events';
import { AuctionsGateway } from 'src/auction/auction.gateway';
import axios from 'axios';

@Injectable()
export class AutionService {
  constructor(
    @InjectModel(Auction.name)
    private readonly auctionModel: mongoose.Model<Auction>,
    private readonly eventEmitter: EventEmitter2,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
    private redisService: RedisService,
    private readonly auctionsGateway: AuctionsGateway,
  ) {}

  async onModuleInit() {
    await this.testRedis();
  }

  async testRedis() {
    try {
      await this.cacheManager.set('test-key', 'hello redis', 300);
      const value = await this.cacheManager.get('test-key'); // Retrieve value
      console.log('✅ Redis Test Value:', value);
    } catch (error) {
      console.error('❌ Redis Error:', error);
    }
  }

  async create(
    user: any,
    createAuctionDto: CreateAuctionDto,
  ): Promise<Auction> {
    const now = new Date();
    const startDate = new Date(createAuctionDto.startDate);
    const endDate = new Date(createAuctionDto.endDate);

    // Check if startDate is in the past
    if (startDate < now) {
      throw new BadRequestException('Start date cannot be in the past');
    }

    // Check if endDate comes before startDate
    if (endDate <= startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    // Create the new auction in the database
    const auction = await this.auctionModel.create({
      ...createAuctionDto,
      creatorId: user._id,
    });

    // Invalidate the cache by deleting the key
    const cacheKey = 'auctions:all';
    try {
      await this.redisService.delete(cacheKey);
      console.log('Cache invalidated successfully after auction creation');
    } catch (cacheError) {
      // Log the error but don't fail the creation operation
      console.error('Failed to invalidate cache:', cacheError.message);
    }

    return auction;
  }

  async findAll() {
    const cacheKey = 'auctions:all';

    try {
      // Attempt to retrieve from cache first
      const cachedData = await this.redisService.get(cacheKey);

      if (cachedData) {
        try {
          const parsedData = JSON.parse(cachedData);
          return parsedData;
        } catch (parseError) {
          console.error('Cache parse error:', parseError.message);
        }
      }

      const auctions = await this.auctionModel.find().lean().exec();

      if (auctions && auctions.length) {
        try {
          await this.redisService.set(cacheKey, JSON.stringify(auctions), 600);
        } catch (cacheError) {
          console.error('Cache set error:', cacheError.message);
        }
      }

      return auctions;
    } catch (error) {
      console.error('Auction findAll error:', error.message);
      throw new Error('Failed to retrieve auctions');
    }
  }

  async findOne(id: string): Promise<Auction> {
    const cacheKey = `auction:${id}`;

    const cachedAuction = await this.redisService.get(cacheKey);

    if (cachedAuction) {
      const parsedData = JSON.parse(cachedAuction);
      return parsedData;
    }

    const auction = await this.auctionModel.findById(id).lean();
    this.redisService.set(cacheKey, JSON.stringify(auction), 600);
    return auction;
  }

  async update(user: any, id: string, updateAutionDto: UpdateAutionDto) {
    const cacheKey = `auction:${id}`;

    const cachedData = await this.redisService.get(cacheKey);
    if (cachedData) {
      await this.redisService.delete(cacheKey);
    }

    const auction = await this.auctionModel.findOneAndUpdate(
      {
        _id: id,
        status: { $ne: AUCTION_STATUS.ONGOING },
        creatorId: user._id,
      },
      updateAutionDto,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!auction) {
      const existingAuction = await this.auctionModel.findById(id);
      if (!existingAuction) {
        throw new NotFoundException();
      } else if (existingAuction.creatorId.toString() !== user._id.toString()) {
        throw new UnauthorizedException();
      } else {
        throw new BadRequestException(
          'Cannot modify an auction that is ongoing',
        );
      }
    }

    await this.redisService.set(cacheKey, JSON.stringify(auction), 600);

    return auction;
  }

  async remove(user: any, id: string) {
    // Only allow deletion if auction is NOT ongoing
    const auction = await this.auctionModel.findOneAndDelete({
      _id: id,
      status: { $ne: AUCTION_STATUS.ONGOING },
      creatorId: user._id,
    });

    if (!auction) {
      // Check if the auction exists at all
      const existingAuction = await this.auctionModel.findById(id);
      if (!existingAuction) {
        throw new NotFoundException();
      } else if (existingAuction.creatorId.toString() !== user._id.toString()) {
        throw new UnauthorizedException();
      } else {
        throw new BadRequestException(
          'Cannot delete an auction that is ongoing',
        );
      }
    }

    // Clear cache if you're using it
    const cacheKey = `auction:${id}`;
    await this.redisService.delete(cacheKey);

    return `Auction deleted successfully`;
  }

  async submitBid(user: any, id: string, bid: BidDto) {
    const cacheKey = `auction:${id}`;

    const cachedData = await this.redisService.get(cacheKey);
    if (cachedData) {
      await this.redisService.delete(cacheKey);
    }

    // Fetch the auction from the database
    const auction = await this.findOne(id);
    if (!auction) {
      throw new NotFoundException();
    }

    if (auction.startingPrice > bid.amount) {
      throw new BadRequestException(
        `Bid must be greater than the auction starting price of: NGN ${auction.startingPrice}`,
      );
    }

    // Ensure the auction is ongoing
    if (auction.status !== AUCTION_STATUS.ONGOING) {
      throw new BadRequestException(
        `Can only place a bid for an ongoing auction`,
      );
    }

    // Validate bid amount
    if (auction.winningBid && bid.amount <= auction.winningBid.amount) {
      throw new BadRequestException(
        `Bid must be higher than the current highest bid: NGN ${auction.winningBid.amount.toLocaleString()}`,
      );
    }

    // Get the current highest bid amount
    const availableBids = auction.bids || [];
    const maxBidAmount = Math.max(0, ...availableBids.map((b) => b.amount));

    if (bid.amount <= maxBidAmount) {
      throw new BadRequestException(
        `Bid must be higher than the current highest bid: NGN ${maxBidAmount.toLocaleString()}`,
      );
    }

    // Store the bid
    const newBid = {
      bidOwner: user._id,
      amount: bid.amount,
      createdAt: new Date(),
    };

    auction.bids.push(newBid);
    auction.winningBid = newBid;

    // Save the updated auction
    await this.auctionModel.updateOne(
      { _id: id },
      {
        $set: { winningBid: newBid },
        $push: { bids: newBid },
      },
    );

    // update the cache
    await this.redisService.set(cacheKey, JSON.stringify(auction), 600);

    await this.redisService.delete('auctions:all');

    // Broadcast the new bid via WebSockets
    const broadcastData = {
      ...newBid,
      auctionId: id,
      bidderName: user.name || user.email || 'Anonymous',
      timestamp: new Date(),
    };

    this.auctionsGateway.emitBidUpdate(id, broadcastData);

    return newBid;
  }

  private paystackUrl = 'https://api.paystack.co/subscription';

  async callSub() {
    try {
      const now = new Date();
      const response = await axios.post(
        this.paystackUrl,
        {
          customer: 'nnamdiosuji0@gmail.com', // Ensure this is a valid customer email
          plan: 'PLN_pcr4kkb0tmjsmnv',
          amount: 40000 * 100, // Assuming the amount is in kobo
          start_date: now.toISOString(), // Use ISO 8601 format for the start date
        },
        {
          headers: {
            Authorization: `Bearer sk_test_924f1f3e749ba7247e947e1b882de7d60d4a6019`,
            'Content-Type': 'application/json',
          },
        },
      );

      console.log('Subscription Response:', response.data);
      return response.data;
    } catch (error) {
      console.error(
        'Error calling Paystack subscription endpoint:',
        error.response?.data || error.message,
      );
      throw new Error('Unable to complete subscription.');
    }
  }

  // @Cron('*/1 * * * *') // Runs every minute
  async checkAuctions() {
    try {
      console.log('Running cron job to change auction status');
      const now = new Date();

      // START auctions if startDate has passed
      const auctionsToStart = await this.auctionModel.find({
        status: AUCTION_STATUS.NOT_STARTED,
        startDate: { $lte: now },
      });

      for (const auction of auctionsToStart) {
        try {
          console.log(`Starting auction: ${auction._id}`);
          const cacheKey = `auction:${auction._id.toString()}`;

          // Invalidate related caches
          await this.invalidateRelatedCaches(auction._id.toString());

          // Update auction status
          auction.status = AUCTION_STATUS.ONGOING;
          await auction.save();

          // Update cache after the database is updated
          await this.redisService.set(cacheKey, JSON.stringify(auction), 600);

          // Emit auction started event
          this.eventEmitter.emit(
            'auction.started',
            new HandleAuctionEvent(auction),
          );
        } catch (error) {
          console.error(`Error starting auction ${auction._id}:`, error);
        }
      }

      // END auctions if endDate has passed
      const auctionsToEnd: any = await this.auctionModel
        .find({
          status: AUCTION_STATUS.ONGOING,
          endDate: { $lte: now },
        })
        .populate('winningBid.bidOwner');

      for (const auction of auctionsToEnd) {
        try {
          console.log(`Ending auction: ${auction._id}`);
          const cacheKey = `auction:${auction._id.toString()}`;

          // Invalidate related caches
          await this.invalidateRelatedCaches(auction._id.toString());

          // Update auction status
          auction.status = AUCTION_STATUS.CLOSED;

          await auction.save();

          // Update cache after the database is updated
          await this.redisService.set(cacheKey, JSON.stringify(auction), 600);

          // Emit auction ended event
          this.eventEmitter.emit(
            'auction.ended',
            new HandleAuctionEvent(auction),
          );
        } catch (error) {
          console.error(`Error ending auction ${auction._id}:`, error);
        }
      }
    } catch (error) {
      console.error('Error in checkAuctions cron job:', error);
    }
  }

  // Helper method to invalidate all related caches
  private async invalidateRelatedCaches(auctionId: string) {
    try {
      await this.redisService.delete('auctions:all');
      await this.redisService.delete(`auction:${auctionId}:bids`);
      // Add other related caches as needed
    } catch (error) {
      console.error(
        `Error invalidating caches for auction ${auctionId}:`,
        error,
      );
    }
  }
}
