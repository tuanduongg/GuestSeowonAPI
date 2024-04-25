import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Department } from 'src/entity/department.entity';
import { In, Repository } from 'typeorm';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectRepository(Department)
    private departRepo: Repository<Department>,
  ) {}

  async fake() {
    return this.departRepo.insert([
      { departName: 'Assy' },
      { departName: 'Per/Acc/IT' },
      { departName: 'QC' },
      { departName: 'Rubber' },
      { departName: 'Injection' },
    ]);
  }
  async getAll() {
    return await this.departRepo.find({});
  }
  async add(body) {
    if (body?.departName) {
      const rs = await this.departRepo.insert({ departName: body.departName });
      return rs;
    }
    return null;
  }
  async update(body, res) {
    if (body?.departID) {
      const department = await this.departRepo.findOne({
        where: { departID: body?.departID },
      });
      if (department) {
        department.departName = body?.departName;
        const result = await this.departRepo.save(department);
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

  async findByCode(arrCode) {
    const data = await this.departRepo.find({
      where: { departCode: In(arrCode) },
    });
    return data;
  }
}
