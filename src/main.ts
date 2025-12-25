import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { GlobalExceptionFilter } from './common/filt/global-exception.filter';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SerializeInterceptor } from './common/interceptor/serialize.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  
  // Global SerializeInterceptor that converts plain objects to DTO instances when @Serialize is used

  app.useGlobalInterceptors(new SerializeInterceptor(app.get(Reflector)));


  const config = new DocumentBuilder()
    .setTitle('My API')
    .setDescription('Backend API documentation')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'access-token',
    )
    .build();

  const configService = app.get(ConfigService);
  const document = SwaggerModule.createDocument(app, config);

  const nodeEnv = configService.get<string>('NODE_ENV');

  if (nodeEnv !== 'production') {
    SwaggerModule.setup('docs', app, document);
  }

  const port = configService.get<number>('port') ?? 3000;

  await app.listen(port);
}
bootstrap();
