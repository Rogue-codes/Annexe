import { Module } from '@nestjs/common';
import { AutionService } from './aution.service';
import { AutionController } from './aution.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AuctionSchema } from './entities/aution.entity';
import { EmailModule } from 'src/email/email.module';
import { UserModule } from 'src/user/user.module';
import { RedisModule } from 'src/redis/redis.module';
import { AuctionsGateway } from 'src/auction/auction.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'Auction',
        schema: AuctionSchema,
      },
    ]),
    EmailModule,
    UserModule,
    RedisModule,
  ],
  controllers: [AutionController],
  providers: [AutionService, AuctionsGateway],
  exports: [AutionService],
})
export class AutionModule {}
