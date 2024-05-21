import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Device } from 'src/entity/device.entity';
import { UserModule } from 'src/user/user.module';
import { Permisstion } from 'src/entity/permission.entity';
import { ListAPI } from 'src/entity/listapi.entity';
import { DeviceService } from './device.service';
import { DeviceController } from './device.controller';
import { ImageDeviceModule } from 'src/image_device/image_device.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Device, ListAPI, Permisstion]),
    UserModule,
    ImageDeviceModule
    ],
  controllers: [DeviceController],
  providers: [DeviceService],
})
export class DeviceModule {}
