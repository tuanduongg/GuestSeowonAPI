import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Unit } from 'src/entity/unit.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UnitService {
  constructor(
    @InjectRepository(Unit)
    private unitRepo: Repository<Unit>,
  ) {}
  async getAll() {
    return await this.unitRepo.find({
      order: {
        unitName: 'ASC',
      },
    });
  }
  async fake() {
    const data = [
      { unitName: 'Bộ' },
      { unitName: 'Chai' },
      { unitName: 'Cái' },
      { unitName: 'Bag' },
      { unitName: 'Box' },
      { unitName: 'Can' },
      { unitName: 'Cây' },
      { unitName: 'Chiếc' },
      { unitName: 'Cuộn' },
      { unitName: 'Đôi' },
      { unitName: 'EA' },
      { unitName: 'KG' },
      { unitName: 'Lọ' },
      { unitName: 'Lon' },
      { unitName: 'Mét' },
      { unitName: 'Miếng' },
      { unitName: 'Pair' },
      { unitName: 'Quyển' },
      { unitName: 'Ram' },
      { unitName: 'Sợi' },
      { unitName: 'Tấm' },
      { unitName: 'Tập' },
      { unitName: 'Thùng' },
      { unitName: 'Tếp' },
      { unitName: 'Tờ' },
      { unitName: 'Túi' },
      { unitName: 'Bì' },
      { unitName: 'Vỉ' },
      { unitName: 'Hộp' },
    ];
    return await this.unitRepo.insert(data);
  }
}
