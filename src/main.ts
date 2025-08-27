import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import compression from 'compression';
import { ConfigService } from '@nestjs/config';
import { json, urlencoded } from 'express';
import { randomUUID } from 'crypto';
import { ClassSerializerInterceptor, ValidationPipe, VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;
  const clientURL = configService.get<string>('CLIENT_URL');
  const isProd = configService.get<string>('NODE_ENV') === 'production';
  const allowLoopback = configService.get<string>('ALLOW_LOOPBACK') === 'true';

  app.use(helmet());



  if (isProd) {
    // 1 год, субдомены, и отметка для preload-списка браузеров
    app.use(helmet.hsts({
      maxAge: 31536000,       // seconds (1 year) — рекомендуемый минимум для prod
      includeSubDomains: true,
      preload: true,
    }));
  }

  // Сжатие ответов
  app.use(compression());

  // Лимиты на тело запроса (DoS/мусор)
  app.use(json({ limit: '1mb' }));
  app.use(urlencoded({ limit: '1mb', extended: true }));

  // В нашем случае лишнее, проект не использует куки авторизацию, у нас токен стейтлесс
  //app.use(cookieParser());

  //  Request-ID для корреляции логов
  app.use((req: any, res, next) => {
    req.id ||= randomUUID();
    res.setHeader('X-Request-Id', req.id);
    next();
  });

  //  Глобальная валидация входа + сериализация выхода
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  //  Префикс + версионирование API
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' }); // /api/v1/..

  //  CORS с белым списком (prod — только фронт; dev — плюс localhost)
  const toKey = (s: string) => {
    try {
      const u = new URL(s);
      const port = u.port || (u.protocol === 'http:' ? '80' : '443');
      return `${u.protocol}//${u.hostname}:${port}`.toLowerCase();
    } catch { return (s || '').toLowerCase(); }
  };

// CLIENT_URLS = "http://localhost:80,https://app.example.com"
  const urls = (configService.get<string>('CLIENT_URLS') || '')
    .split(',').map(s => s.trim()).filter(Boolean);
  const whitelist = new Set(urls.map(toKey));

  app.enableCors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);

      const key = toKey(origin);
      if (whitelist.has(key)) return cb(null, true);

      // Разрешаем loopback-хосты по флажку
      if (allowLoopback) {
        try {
          const u = new URL(origin);
          const host = u.hostname.toLowerCase();
          if (host === 'localhost' || host === '127.0.0.1' || host === '::1') {
            return cb(null, true);
          }
        } catch {}
      }

      // Включи лог на время диагностики:
      console.warn('[CORS] blocked origin=', origin, 'key=', key, 'isProd=', isProd, 'whitelist=', Array.from(whitelist));
      return cb(new Error('CORS blocked'));
    },
    methods: ['GET','HEAD','PUT','PATCH','POST','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization','X-Requested-With','X-CSRF-Token','X-Request-Id'],
    exposedHeaders: ['Content-Length','X-Request-Id'],
    credentials: true,
    maxAge: 86400,
  });


  await app.listen(port);
}
bootstrap();
