import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HistoryGuest } from 'src/entity/history_guest.entity';

@Injectable()
export class HistoryGuestService {
  constructor(
    @InjectRepository(HistoryGuest)
    private historyGuestRepo: Repository<HistoryGuest>,
  ) {}
  async add(data: any, guestID, username) {
    if (data && guestID && username) {
      const arrSave = [];
      guestID.map((item) => {
        const newHis = new HistoryGuest();
        newHis.TIME = new Date();
        newHis.USER = username;
        newHis.TYPE = data?.TYPE ?? '';
        newHis.VALUE = data?.VALUE ?? '';
        newHis.guest = item;
        arrSave.push(newHis);
      });
      try {
        const dataSave = await this.historyGuestRepo.save(arrSave);
        return dataSave;
      } catch (error) {
        return null;
      }
    }
    return null;
  }
  async findByGuest(body, request, res) {
    const guestID = body?.data;
    if (guestID) {
      try {
        const data = await this.historyGuestRepo.find({
          where: {
            guest: {
              GUEST_ID: guestID,
            },
          },
        });
        return res.status(HttpStatus.OK).send(data);
      } catch (error) {
        // return res.status(HttpStatus.BAD_REQUEST).send(error.);
      }
    }
    return res
      .status(HttpStatus.BAD_REQUEST)
      .send({ message: 'cannot found!' });
  }
}
