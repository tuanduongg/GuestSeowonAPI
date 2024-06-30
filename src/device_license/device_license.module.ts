import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceLicenseService } from './device_license.service';
import { UserModule } from 'src/user/user.module';
import { DeviceLicenseController } from './device_license.controller';
import { DeviceLicense } from 'src/entity/device_license.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DeviceLicense]),UserModule],
  controllers: [DeviceLicenseController],
  providers: [DeviceLicenseService],
  exports: [DeviceLicenseService],
})
export class DeviceLicenseModule {}
