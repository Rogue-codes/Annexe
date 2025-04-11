import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Enable CORS
  app.enableCors();

  // Set global API prefix
  app.setGlobalPrefix('api/v1/annexe');

  // Use global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove non-whitelisted properties
      transform: true, // Automatically transform payloads to DTO instances
      forbidNonWhitelisted: true, // Reject requests with unexpected properties
    }),
  );

  // Start the server
  await app.listen(3000);
  console.log(`Application is running on: http://localhost:3000/api/v1/annexe`);
}
bootstrap();
