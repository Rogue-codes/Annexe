import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;

  constructor(private readonly configService: ConfigService) {
    this.client = new Redis({
      host: 'redis-12120.c341.af-south-1-1.ec2.redns.redis-cloud.com',
      port: 12120,
      username: 'default',
      password: 'YByUvy9DR0ba5ip9UguFYlph1yVVPoUq',
    });

    this.client.on('error', (err) => {
      console.error('Redis Client Error', err);
    });
  }

  async onModuleInit() {
    console.log('Connected to Redis');
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    if (ttl) {
      await this.client.set(key, value, 'EX', ttl);
    } else {
      await this.client.set(key, value);
    }
  }

  async get(key: string): Promise<any> {
    return this.client.get(key);
  }

  async delete(key: string): Promise<number> {
    return this.client.del(key);
  }

  async onModuleDestroy() {
    await this.client.quit();
    console.log('Redis Client Disconnected');
  }
}
