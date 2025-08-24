import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule);
  app.setGlobalPrefix('/api/v1');
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // elimina propiedades no definidas en DTOs
      forbidNonWhitelisted: true, // lanza error si llegan propiedades no permitidas
      transform: true, // transforma automáticamente payloads a objetos del DTO
    }),
  );

  const configService = app.get<ConfigService>(ConfigService);

  await app.listen(configService.get<number>('SERVICE_PORT', 3000), '0.0.0.0');
}
bootstrap();
