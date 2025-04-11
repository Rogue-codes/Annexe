import { Module } from '@nestjs/common';
import { WatchlistService } from './watchlist.service';
import { WatchlistController } from './watchlist.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { WatchlistSchema } from './entities/watchlist.entity';
import { UserModule } from 'src/user/user.module';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'Watchlist',
        schema: WatchlistSchema,
      },
    ]),
    UserModule,
    EmailModule
  ],
  controllers: [WatchlistController],
  providers: [WatchlistService],
  exports: [WatchlistService],
})
export class WatchlistModule {}
