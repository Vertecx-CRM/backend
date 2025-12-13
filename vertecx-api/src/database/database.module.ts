import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as fs from 'fs';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USER'),
        password: config.get<string>('DB_PASS'),
        database: config.get<string>('DB_NAME'),
        synchronize: config.get<string>('DB_SYNC') === 'true',
        autoLoadEntities: true,

        // POOL DE CONEXIONES (OBLIGATORIO PARA NO SATURAR AIVEN)
        extra: {
          max: 10, // Máximo recomendado para planes gratuitos
          min: 1,
          idleTimeoutMillis: 30000, // Libera conexiones inactivas
          connectionTimeoutMillis: 5000, // Evita bloqueos largos
        },

        ssl: {
          rejectUnauthorized: true,
          ca: fs.readFileSync('src/certs/ca.pem').toString(),
        },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
