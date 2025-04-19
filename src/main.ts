import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from "./common/filters/http-exception.filter"
import { ConfigService } from "@nestjs/config"
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from "@nestjs/common"

async function bootstrap() {
  const logger = new Logger("Bootstrap")
  logger.log("Starting application...")

  const app = await NestFactory.create(AppModule, {
    logger: ["error", "warn", "log", "debug", "verbose"],
  });

  // Global prefix
  app.setGlobalPrefix("api")
  logger.log("Global prefix set to /api")

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));
  logger.log("Global validation pipe configured")

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter())
  logger.log("Global exception filter configured")

  // Get port from config
  const configService = app.get(ConfigService)
  const port = configService.get<number>("PORT", 3000)

  await app.listen(port)
  logger.log(`Application is running on: http://localhost:${port}`)
}
bootstrap();
