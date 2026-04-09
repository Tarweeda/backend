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
      nestApp.enableCors({
        origin: process.env.CORS_ORIGIN || '*',
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
