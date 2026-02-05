import 'reflect-metadata';

import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { ENVEnum } from './common/enum/env.enum';
import { AllExceptionsFilter } from './core/filter/http-exception.filter';
import { SeedService } from './lib/seed/seed.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  app.use(cookieParser());
  const configService = app.get(ConfigService);

  // * enable cors
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:5173',
      'http://localhost:5174',
      'https://oneisoneent.com',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // * add global pipes
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: false }));

  // * add global filters
  app.useGlobalFilters(new AllExceptionsFilter());

  // * Swagger config with Bearer Auth
  const config = new DocumentBuilder()
    .setTitle('oneisone API')
    .setDescription(
      'The oneisone API description - Complete authentication and music distribution platform',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // * add body parser
  app.use(
    '/path-to-stripe-webhook',
    bodyParser.raw({ type: 'application/json' }),
  );

  // * set port
  const port = parseInt(configService.get<string>(ENVEnum.PORT) ?? '3000', 10);
  await app.listen(port);

  // * run seed
  const seedService = app.get(SeedService);
  await seedService.seed();
}
bootstrap();
