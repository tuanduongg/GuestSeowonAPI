import {  Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { License } from 'src/entity/license.entity';
import { Repository } from 'typeorm';

@Injectable()
export class LicenseService {
  constructor(
    @InjectRepository(License)
    private repo: Repository<License>,
  ) { }

  async getAll() {
    return await this.repo.find({});
  }
}
