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
  ) { }
  async all(body, request, res) {
    const data = await this.imageDevice.find({});
    return res?.status(HttpStatus.OK)?.send(data);
  }
  async add(arr: []) {
    if (arr?.length > 0) {
      try {
        const res = await this.imageDevice.save(arr);
        return res;
      } catch (error) { }
    }
    return null;
  }
  async delete(body, res) {
    const id = body?.imageID
    const imageDevice = await this.imageDevice.findOne({ where: { IMAGE_ID: id } });
    if (imageDevice) {
      const imageDeviceTemp = imageDevice;
      try {
        await this.imageDevice.remove(imageDevice);
        await this.deleteOnFolder([imageDeviceTemp]);
        return res.status(HttpStatus.OK).send({message:'Delete successful!'})
      } catch (error) {
        return res.status(HttpStatus.BAD_REQUEST).send({message:'Delete fail!'})
      }
    }else {
      return res.status(HttpStatus.BAD_REQUEST).send({message:'Image not found!'})
    }

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
            return true;
          }
        });
      } catch (error) {
        return null;
      }
    }
    return null;
  }
}
