import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TheatersModule } from './theaters/theaters.module';

function validateEnvironment(config: Record<string, unknown>) {
  for (const key of ['DB_HOST', 'DB_USER', 'DB_PASS', 'DB_NAME']) {
    if (typeof config[key] !== 'string' || config[key].trim() === '') {
      throw new Error(`La variable de entorno ${key} es obligatoria.`);
    }
  }

  const port = Number(config.DB_PORT ?? 3306);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('La variable DB_PORT debe ser un puerto válido (1-65535).');
  }

  const appPort = Number(config.PORT ?? 3000);
  if (!Number.isInteger(appPort) || appPort < 1 || appPort > 65535) {
    throw new Error('La variable PORT debe ser un puerto válido (1-65535).');
  }

  return { ...config, DB_PORT: port, PORT: appPort };
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnvironment }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.getOrThrow<string>('DB_HOST'),
        port: configService.getOrThrow<number>('DB_PORT'),
        username: configService.getOrThrow<string>('DB_USER'),
        password: configService.getOrThrow<string>('DB_PASS'),
        database: configService.getOrThrow<string>('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false,
      }),
    }),
    TheatersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
