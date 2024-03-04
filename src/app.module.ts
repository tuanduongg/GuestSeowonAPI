import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { ConnectionOptions, createConnection } from 'typeorm';
import { AuthModule } from './auth/auth.module';
import { GuestModule } from './guest/guest.module';
import { GuestInfoModule } from './guest_info/guest_info.module';
import { RoleModule } from './role/role.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      useFactory: async (): Promise<ConnectionOptions> => {
        const connectionOptions: ConnectionOptions = {
          type: 'mssql',
          host: `${process.env.DB_HOST}`,
          port: parseInt(process.env.DB_PORT),
          username: `${process.env.DB_USERNAME}`,
          password: `${process.env.DB_PASSWORD}`,
          database: `${process.env.DB_DATABASE}`,
          options: { trustServerCertificate: true }, //for mssql
          entities: [__dirname + '/../**/*.entity.js'],
          requestTimeout: 30000, //for mssql
          synchronize: true,
          pool: {
            //for mssql
            max: 10,
            min: 0,
            idleTimeoutMillis: 30000,
          },
        };
        const connection = await createConnection(connectionOptions);
        console.log('Connected to the database', connection.options.database);
        return connectionOptions;
      },
    } as TypeOrmModuleAsyncOptions),
    AuthModule,
    GuestModule,
    GuestInfoModule,
    RoleModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
