import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { validationPipe } from './shared/pipes';
import { WsAdapter } from '@nestjs/platform-ws';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.useGlobalPipes(validationPipe);
  app.useWebSocketAdapter(new WsAdapter(app));

  const port = process.env.PORT ?? 3000;

  await app.listen(port);
  console.log(`Listening on port: ${port}`);
}

void bootstrap();
