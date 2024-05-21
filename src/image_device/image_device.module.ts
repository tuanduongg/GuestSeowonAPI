import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';
import { Permisstion } from 'src/entity/permission.entity';
import { ListAPI } from 'src/entity/listapi.entity';
import { ImageDevice } from 'src/entity/image_device.entity';
import { ImageDeviceService } from './image_device.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ImageDevice, ListAPI, Permisstion]),
    UserModule,
  ],
  controllers: [],
  providers: [ImageDeviceService],
  exports: [ImageDeviceService],
})
export class ImageDeviceModule {}
