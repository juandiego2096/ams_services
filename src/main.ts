import { NestFactory } from '@nestjs/core';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AppConfigService } from './config/configuration.service';

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

  const appConfig = app.get(AppConfigService);

  await app.listen(appConfig.serverPort, appConfig.serverHost);
}
bootstrap();
