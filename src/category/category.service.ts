import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from 'src/entity/category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
  ) {}

  async fake() {
    return this.categoryRepo.insert([
      { categoryName: 'Văn phòng phẩm' },
      { categoryName: 'Hàng quần áo' },
      { categoryName: 'Nước uống' },
    ]);
  }
  async getAll() {
    return await this.categoryRepo.find({});
  }
  async add(body) {
    if (body?.categoryName) {
      const rs = await this.categoryRepo.insert({
        categoryName: body.categoryName,
      });
      return rs;
    }
    return null;
  }
  async update(body, res) {
    if (body?.categoryID) {
      const obj = await this.categoryRepo.findOne({
        where: { categoryID: body?.categoryID },
      });
      if (obj) {
        obj.categoryName = body?.categoryName;
        const result = await this.categoryRepo.save(obj);
        return res.status(HttpStatus.OK).send(result);
      }
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send({ message: 'Cannot found!' });
    }
    return res
      .status(HttpStatus.BAD_REQUEST)
      .send({ message: 'Cannot update department!' });
  }
}
