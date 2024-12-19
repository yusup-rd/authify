import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for the frontend
  const frontendPort = process.env.FRONTEND_PORT || 3000;
  app.enableCors({
    origin: `http://localhost:${frontendPort}`,
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type, Authorization, Cookie',
    credentials: true,
  });

  // Enable validation for all incoming requests
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Enable security features
  app.use(helmet());

  // Enable cookie parsing
  app.use(cookieParser());

  // Enable Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Authify API')
    .setDescription('API documentation for Authify')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(process.env.BACKEND_PORT || 8000);
}

bootstrap();
