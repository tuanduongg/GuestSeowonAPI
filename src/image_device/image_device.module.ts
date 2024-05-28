import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';
import { Permisstion } from 'src/entity/permission.entity';
import { ListAPI } from 'src/entity/listapi.entity';
import { ImageDevice } from 'src/entity/image_device.entity';
import { ImageDeviceService } from './image_device.service';
import { ImageDeviceController } from './image_device.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ImageDevice, ListAPI, Permisstion]),
    UserModule,
  ],
  controllers: [ImageDeviceController],
  providers: [ImageDeviceService],
  exports: [ImageDeviceService],
})
export class ImageDeviceModule {}
