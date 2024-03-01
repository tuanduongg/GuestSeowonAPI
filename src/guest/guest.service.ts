import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, Like, In } from 'typeorm';
import { Guest } from 'src/entity/guest.entity';
import { GuestInfo } from 'src/entity/guest_info.entity';
import { GuestDate } from 'src/entity/guest_date.entity';
import { STATUS_ENUM } from 'src/enum/status.enum';

@Injectable()
export class GuestService {
  constructor(
    @InjectRepository(Guest)
    private guestRepo: Repository<Guest>,
    @InjectRepository(GuestInfo)
    private guestInfoRepo: Repository<GuestInfo>,
    @InjectRepository(GuestDate)
    private guestDateRepo: Repository<GuestDate>,
  ) {}
  getHello(): string {
    return 'Hello World!!!!!! guest';
  }

  async all(body, request, res) {
    let arr = [];
    if (body?.date) {
      arr = JSON.parse(body?.date);
    }
    const data = await this.guestRepo.find({
      select: {
        GUEST_ID: true,
        TIME_IN: true,
        TIME_OUT: true,
        COMPANY: true,
        PERSON_SEOWON: true,
        STATUS: true,
        guest_info: {
          FULL_NAME: true,
        },
        guest_date: {
          DATE: true,
        },
      },
      where: {
        DELETE_AT: null,
        guest_date: {
          DATE: In(arr),
        },
      },
      relations: ['guest_info', 'guest_date'],
      order: { TIME_IN: 'ASC' },
    });
    return res.status(HttpStatus.OK).send(data);
  }
  async findByID(body, request, res) {
    if (body?.id) {
      const data = await this.guestRepo.findOne({
        where: {
          DELETE_AT: null,
          GUEST_ID: body.id,
        },
        relations: ['guest_info', 'guest_date'],
      });
      if (data) {
        return res.status(HttpStatus.OK).send(data);
      }
    }
    return res
      .status(HttpStatus.BAD_REQUEST)
      .send({ message: 'Không tìm thấy bản ghi!' });
  }
  // {
  //   company: 'asdfsdf',
  //   carNumber: 'asdfasdf',
  //   personSeowon: 'asdfasdf',
  //   department: 'asfasdf',
  //   reason: 'asdfasdf',
  //   timeIn: '2024-02-29T03:47:30.891Z',
  //   timeOut: '2024-02-29T03:47:30.891Z',
  //   date: [ '29/02/2024', '01/03/2024', '02/03/2024' ],
  //   names: [ 'sdsdfsdf' ]
  // }
  async add(body, request, res) {
    const newGuest = new Guest();
    newGuest.TIME_IN = body?.timeIn;
    newGuest.TIME_OUT = body?.timeOut;
    newGuest.COMPANY = body?.company;
    newGuest.CAR_NUMBER = body?.carNumber;
    newGuest.PERSON_SEOWON = body?.personSeowon;
    newGuest.DEPARTMENT = body?.department;
    newGuest.REASON = body?.reason;
    newGuest.CREATE_BY = request?.user?.username;
    if (body?.names) {
      const arrGuesInfo = [];
      body.names.map((item) => {
        if (item) {
          const newGuesInfo = new GuestInfo();
          newGuesInfo.FULL_NAME = item;
          arrGuesInfo.push(newGuesInfo);
        }
      });
      newGuest.guest_info = arrGuesInfo;
    }
    if (body?.date) {
      const arrDate = [];
      body.date.map((item) => {
        const newGuestDate = new GuestDate();
        newGuestDate.DATE = item;
        arrDate.push(newGuestDate);
      });
      newGuest.guest_date = arrDate;
    }
    try {
      const savedGuest = await this.guestRepo.save(newGuest);
      return res.status(HttpStatus.OK).send(savedGuest);
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).send(error);
    }
  }

  async delete(body, request, res) {
    console.log('request?.user', request?.user);
    const data = body?.data;
    if (data) {
      const dataUpdate = data.map((item) => {
        return {
          GUEST_ID: item,
          DELETE_AT: new Date(),
          DELETE_BY: request?.user?.username,
        };
      });
      const result = await this.guestRepo.save(dataUpdate);
      return res.status(HttpStatus.OK).send(result);
    }
    return res
      .status(HttpStatus.BAD_REQUEST)
      .send({ message: 'Cannot found ID!' });
  }

  async fake() {
    const newGuest = new Guest();
    newGuest.TIME_IN = '13:30';
    newGuest.TIME_OUT = '16:30';
    newGuest.COMPANY = 'Anyone';
    newGuest.CAR_NUMBER = '98H2-121212';
    newGuest.PERSON_SEOWON = 'TuanIT';
    newGuest.DEPARTMENT = 'IT';
    newGuest.REASON = 'meeting';
    newGuest.CREATE_BY = 'admin';
    const newGuesInfo = new GuestInfo();
    newGuesInfo.FULL_NAME = 'Nguyễn Anh Tuấn';
    const newGuestDate = new GuestDate();
    newGuestDate.DATE = '29/2/2024';
    newGuest.guest_info = [newGuesInfo];
    newGuest.guest_date = [newGuestDate];
    return await this.guestRepo.save(newGuest);
  }
  // async test() {
  //   const user = await this.guestRepo.save({
  //     userID: '8CCF9405-FAB8-EE11-A1CA-04D9F5C9D2EB',
  //     isApprover: true,
  //   });
  //   return user;
  // }
}
