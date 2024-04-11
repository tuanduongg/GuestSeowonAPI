import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Image } from 'src/entity/image.entity';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import { join } from 'path';

@Injectable()
export class ImageService {
  constructor(
    @InjectRepository(Image)
    private imageRepo: Repository<Image>,
  ) {}

  async fake() {
    return this.imageRepo.insert([
      {
        productID: 'da025e2f-09aa-ee11-a1ca-04d9f5c9d2eb',
        url: '/image.jpg',
      },
      {
        productID: 'db025e2f-09aa-ee11-a1ca-04d9f5c9d2eb',
        url: '/image2.jpg',
      },
    ]);
  }
  async getAll() {
    return await this.imageRepo.find({});
  }
  async deleteByID(id) {
    try {
      const recordToDelete = await this.imageRepo.findOne({
        where: { imageID: id },
      });
      if (recordToDelete) {
        const imagePath =
          join(__dirname, '..', 'public').replace('\\dist', '') +
          '\\' +
          recordToDelete?.url;
        console.log('imagePath', imagePath);
        const remove = await this.imageRepo.remove(recordToDelete);
        fs.unlinkSync(imagePath);
        console.log('remove', remove);
        return true;
      }
    } catch (error) {
      return null;
    }
  }
}
