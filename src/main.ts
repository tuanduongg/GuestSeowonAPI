import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix('api');
  const configService = app.get(ConfigService);
  app.enableCors({
    allowedHeaders: '*',
    origin: '*',
  });
  const port = configService.get('PORT') || 8000;
  await app.listen(port);
  console.log('app start at port ' + port);
}
bootstrap();
