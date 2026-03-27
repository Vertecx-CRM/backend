import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const expressApp = app.getHttpAdapter().getInstance();

  expressApp.disable('x-powered-by');
  expressApp.use((req, res, next) => {
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains',
    );
    next();
  });

  app.enableCors({
    origin: (origin, callback) => callback(null, true),
    credentials: true,
  });

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Vertecx API')
    .setDescription('Documentación de la API de Vertecx')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customCss: `
    /* --- RESET & ESTRUCTURA INDUSTRIAL --- */
    .swagger-ui {
      background-color: #ffffff;
      font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }
    
    .swagger-ui .topbar {
      background-color: #000000; /* Barra negra sólida */
      padding: 15px 0;
      border-bottom: 4px solid #B22222; /* Línea de acento roja */
    }

    /* --- INFO & TÍTULOS --- */
    .swagger-ui .info {
      margin: 50px 0;
    }

    .swagger-ui .info .title {
      font-size: 42px;
      font-weight: 900;
      color: #000000;
      text-transform: uppercase;
      letter-spacing: -1px;
    }

    .swagger-ui .info p {
      font-size: 16px;
      color: #666;
      border-left: 3px solid #eee;
      padding-left: 20px;
    }

    /* --- BOTÓN AUTHORIZE (Estilo SistemasPC) --- */
    .swagger-ui .btn.authorize {
      background-color: #000000;
      color: #fff;
      border: none;
      border-radius: 0; /* Esquinas rectas */
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 2px;
      padding: 10px 30px;
      transition: all 0.3s;
    }

    .swagger-ui .btn.authorize:hover {
      background-color: #B22222;
      color: #fff;
    }

    .swagger-ui .btn.authorize svg {
      fill: #fff;
    }

    /* --- BLOQUES DE OPERACIÓN (OPBLOCKS) --- */
    /* Quitamos los fondos pesados y usamos bordes finos */
    .swagger-ui .opblock {
      border-radius: 0 !important;
      border: 1px solid #eee !important;
      box-shadow: none !important;
      background: #ffffff !important;
    }

    .swagger-ui .opblock .opblock-summary {
      padding: 15px;
    }

    /* Estilos por Método (Borde lateral grueso) */
    .swagger-ui .opblock.opblock-get { border-left: 6px solid #10a54a !important; }
    .swagger-ui .opblock.opblock-post { border-left: 6px solid #B22222 !important; }
    .swagger-ui .opblock.opblock-put { border-left: 6px solid #fca130 !important; }
    .swagger-ui .opblock.opblock-delete { border-left: 6px solid #f93e3e !important; }
    .swagger-ui .opblock.opblock-patch { border-left: 6px solid #50e3c2 !important; }

    /* Etiquetas de Método (Labels) */
    .swagger-ui .opblock .opblock-summary-method {
      border-radius: 0;
      font-weight: 900;
      text-transform: uppercase;
      min-width: 100px;
    }

    /* --- TAGS / SECCIONES --- */
    .swagger-ui .opblock-tag {
      font-size: 20px;
      font-weight: 900;
      color: #000;
      border-bottom: 2px solid #000;
      padding: 10px 0;
      text-transform: uppercase;
    }

    /* --- ESQUEMAS / MODELS --- */
    .swagger-ui section.models {
      border: 1px solid #eee;
      border-radius: 0;
    }

    .swagger-ui section.models.is-open h4 {
      border-bottom: 1px solid #eee;
      background: #fafafa;
      color: #000;
      font-weight: 900;
      text-transform: uppercase;
    }

    /* --- INPUTS & TEXTAREAS --- */
    .swagger-ui input, .swagger-ui textarea, .swagger-ui select {
      border-radius: 0 !important;
      border: 1px solid #ddd !important;
      background: #fdfdfd !important;
      font-family: monospace;
    }

    .swagger-ui input:focus {
      border-color: #B22222 !important;
    }

    /* --- SCROLLBAR TÉCNICA --- */
    ::-webkit-scrollbar {
      width: 10px;
    }

    ::-webkit-scrollbar-track {
      background: #f1f1f1;
    }

    ::-webkit-scrollbar-thumb {
      background: #000;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: #B22222;
    }
  `,
  });

  await app.listen(3001, '0.0.0.0');
  console.log('API corriendo en http://localhost:3001/api/docs');
}

bootstrap();
