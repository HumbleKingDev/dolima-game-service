/* eslint-disable prettier/prettier */
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as rateLimit from 'express-rate-limit';

import { AppModule } from './app.module';
import { HttpExceptionFilter } from './exceptions/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new HttpExceptionFilter());
  // app.use(
  //   rateLimit({
  //     windowMs: 10 * 60 * 1000, // 
  //     max: 15, // limit each IP to 100 requests per windowMs
  //   }),
  // );
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
