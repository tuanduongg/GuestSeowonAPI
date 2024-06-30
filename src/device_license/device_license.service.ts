import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { DeviceLicense } from 'src/entity/device_license.entity';

@Injectable()
export class DeviceLicenseService {
  constructor(
    @InjectRepository(DeviceLicense)
    private repo: Repository<DeviceLicense>,
  ) {}

  async add(data: Array<DeviceLicense>) {
    return await this.repo.save(data);
  }
  async removeAndSave(deviceID: string, data: Array<DeviceLicense>) {
    try {
      await this.repo.delete({ device: { DEVICE_ID: deviceID } });
      return await this.repo.save(data);
    } catch (error) {
      console.log('error', error);

      return null;
    }
  }
  async allDevice() {
    return await this.repo.find({});
  }
  async saveMultiple(arr) {
    return await this.repo.save(arr);
  }
  async removeByIdDevice(deviceIds: Array<string>) {
    if (deviceIds?.length > 0) {
      return await this.repo.delete({ device: { DEVICE_ID: In(deviceIds) } });
    }
    return null;
  }
}
