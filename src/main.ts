import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // Preserve raw body for Stripe webhook signature verification
    rawBody: true,
  });

  // Security headers: XSS protection, clickjacking, MIME sniffing, etc.
  app.use(helmet());

  const allowedOrigin = process.env.CORS_ORIGIN;
  if (!allowedOrigin) {
    throw new Error('CORS_ORIGIN env variable is not set');
  }

  app.enableCors({
    origin: allowedOrigin,
    credentials: true,
  });

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Tarweeda API running on http://localhost:${port}/api/v1`);
}
bootstrap();
