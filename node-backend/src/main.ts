import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { validationPipe } from './shared/pipes';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(validationPipe);

  const port = process.env.PORT ?? 3000;

  await app.listen(port);
  console.log(`Listening on port: ${port}`);
}

void bootstrap();
