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
import { SocketModule } from './socket/socket.module';
import { MigrateModule } from './migrate/migrate.module';
import { UserModule } from './user/user.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { HistoryGuestModule } from './history_guest/history_guest.module';
import { ProductModule } from './product/product.module';
import { CategoryModule } from './category/category.module';
import { ImageModule } from './image/image.module';
import { DepartmentModule } from './department/department.module';
import { OrderModule } from './order/order.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
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
    SocketModule,
    MigrateModule,
    UserModule,
    HistoryGuestModule,
    ProductModule,
    CategoryModule,
    ImageModule,
    DepartmentModule,
    OrderModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
