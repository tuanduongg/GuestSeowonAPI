import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';

import { join } from 'path';
import { ImageDevice } from 'src/entity/image_device.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ImageDeviceService {
  constructor(
    @InjectRepository(ImageDevice)
    private imageDevice: Repository<ImageDevice>,
  ) {}
  async all(body, request, res) {
    const data = await this.imageDevice.find({});
    return res?.status(HttpStatus.OK)?.send(data);
  }
  async add(arr: []) {
    if (arr?.length > 0) {
      try {
        const res = await this.imageDevice.save(arr);
        return res;
      } catch (error) {}
    }
    return null;
  }
  async deleteOnFolder(arr) {
    if (arr?.length > 0) {
      try {
        arr.map((recordToDelete) => {
          const imagePath =
            join(__dirname, '..', 'public').replace('\\dist', '') +
            '\\' +
            recordToDelete?.URL;
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
          }
        });
      } catch (error) {
        return null;
      }
    }
    return null;
  }
}
