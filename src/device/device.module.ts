import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Device } from 'src/entity/device.entity';
import { UserModule } from 'src/user/user.module';
import { Permisstion } from 'src/entity/permission.entity';
import { ListAPI } from 'src/entity/listapi.entity';
import { DeviceService } from './device.service';
import { DeviceController } from './device.controller';
import { ImageDeviceModule } from 'src/image_device/image_device.module';
import { DeviceLicenseModule } from 'src/device_license/device_license.module';
import { CategoryModule } from 'src/category/category.module';
import { LicenseModule } from 'src/License/license.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Device, ListAPI, Permisstion]),
    UserModule,
    ImageDeviceModule,
    DeviceLicenseModule,
    CategoryModule,
    LicenseModule
    ],
  controllers: [DeviceController],
  providers: [DeviceService],
})
export class DeviceModule {}
