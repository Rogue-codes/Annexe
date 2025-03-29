import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Enable CORS
  app.enableCors();

  // Set global API prefix
  app.setGlobalPrefix('api/v1/annexxe');

  // Use global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove non-whitelisted properties
      transform: true, // Automatically transform payloads to DTO instances
      forbidNonWhitelisted: true, // Reject requests with unexpected properties
    }),
  );

  // Swagger configuration
// Swagger configuration
const config = new DocumentBuilder()
  .setTitle('Airbnb Clone')
  .setDescription('The Airbnb API description')
  .setVersion('1.0')
  .addTag('API') // Replace 'API' with a relevant tag
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT', // You can specify the format, e.g., JWT
    },
    'access-token', // This is the name of the security scheme
  )
  .build();

// Create the Swagger document
const document = SwaggerModule.createDocument(app, config);

// Setup Swagger module
SwaggerModule.setup('api-docs', app, document, {
  swaggerOptions: {
    filter: true, // Enable filtering for better search
    showRequestDuration: true, // Show duration of API requests
  },
});

  

  // Start the server
  await app.listen(3000);
  console.log(`Application is running on: http://localhost:3000/api-docs`);
}
  await app.listen(3000);
}
bootstrap();
