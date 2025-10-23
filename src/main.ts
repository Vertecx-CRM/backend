import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  // 🔥 Activar CORS correctamente
  app.enableCors({
    origin: ['http://localhost:3000'], 
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  await app.listen(3001);
  console.log('🚀 Backend ejecutándose en http://localhost:3001');
}
bootstrap();
