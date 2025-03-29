import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    CacheModule.register({
      max: 100,
      ttl: 300,
      isGlobal: true,
      store: redisStore,
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      password: process.env.REDIS_PASSWORD,
    }),
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGO_URI),
    UserModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: '3d',
      },
    }),
    EventEmitterModule.forRoot(),
    EmailModule,
    WalletModule,
    AuthModule,
    RoomModule,
    OpenApiModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
