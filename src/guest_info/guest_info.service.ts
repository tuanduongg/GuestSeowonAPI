import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GuestInfo } from 'src/entity/guest_info.entity';

@Injectable()
export class GuestInfoService {
  constructor(
    @InjectRepository(GuestInfo)
    private guestInfoRepo: Repository<GuestInfo>,
  ) {}
  async update(body, request, res) {
    if (body?.NAME_ID) {
      const newGuest = await this.guestInfoRepo.save({
        NAME_ID: body?.NAME_ID,
        FULL_NAME: body?.FULL_NAME,
      });
      return res.status(HttpStatus.OK).send(newGuest);
    }
    return res
      .status(HttpStatus.BAD_REQUEST)
      .send({ message: 'Cannot update!' });
  }
  async delete(body, request, res) {
    if (body?.NAME_ID) {
      const newGuest = await this.guestInfoRepo.delete({
        NAME_ID: body?.NAME_ID,
      });
      return res.status(HttpStatus.OK).send(newGuest);
    }
    return res
      .status(HttpStatus.BAD_REQUEST)
      .send({ message: 'Cannot delete!' });
  }
}
