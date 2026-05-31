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

  const corsOrigin = process.env.CORS_ORIGIN;
  if (!corsOrigin) {
    throw new Error('CORS_ORIGIN env variable is not set');
  }

  const allowedOrigins = corsOrigin.split(',').map((o) => o.trim());

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${origin} not allowed`));
      }
    },
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
