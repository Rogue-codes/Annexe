import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { UserModule } from './user/user.module';
import { EmailService } from './email/email.service';
import { EmailModule } from './email/email.module';
import { AutionModule } from './aution/aution.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CacheModule } from '@nestjs/cache-manager';
import { RedisModule } from './redis/redis.module';
import { WatchlistModule } from './watchlist/watchlist.module';
import { AuctionsGateway } from './auction/auction.gateway';
import { BankModule } from './bank/bank.module';

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async () => ({
        ttl: 1000 * 60 * 60,
        url: 'default:pm7MXD9itcGGDbJnlTuGWpMn8KilRxx5@redis-16526.c341.af-south-1-1.ec2.redns.redis-cloud.com:16526',
      }),
    }),
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGO_URI),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: '3d',
      },
    }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    UserModule,
    EmailModule,
    AutionModule,
    RedisModule,
    WatchlistModule,
    BankModule,
  ],
  controllers: [AppController],
  providers: [AppService, EmailService, AuctionsGateway],
})
export class AppModule {}
