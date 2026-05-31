import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

const server = express();
let app: any;

async function bootstrap() {
  if (!app) {
    try {
      const nestApp = await NestFactory.create(AppModule, new ExpressAdapter(server));
      const allowedOrigins = (process.env.CORS_ORIGIN || '')
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean);
      nestApp.enableCors({
        origin: (origin, callback) => {
          if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
          } else {
            callback(new Error(`CORS: origin ${origin} not allowed`));
          }
        },
        credentials: true,
      });
      nestApp.setGlobalPrefix('api/v1');
      nestApp.useGlobalPipes(
        new ValidationPipe({
          whitelist: true,
          transform: true,
          forbidNonWhitelisted: true,
        }),
      );
      await nestApp.init();
      app = nestApp;
    } catch (error) {
      console.error('NestJS bootstrap error:', error);
      throw error;
    }
  }
  return server;
}

export default async (req: any, res: any) => {
  try {
    const s = await bootstrap();
    s(req, res);
  } catch (error) {
    console.error('Request handler error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: String(error) });
  }
};
