import { HttpStatus, Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Guest } from 'src/entity/guest.entity';
import { GuestInfo } from 'src/entity/guest_info.entity';
import { GuestDate } from 'src/entity/guest_date.entity';
import { STATUS_ENUM } from 'src/enum/status.enum';
import { SocketGateway } from 'src/socket/socket.gateway';
import { concatDateString, concatGuestInfo, formatHourMinus } from 'src/helper';
import { DiscordService } from 'src/discord/discord.service';

@Injectable()
export class GuestService {
  constructor(
    @InjectRepository(Guest)
    private guestRepo: Repository<Guest>,
    @InjectRepository(GuestInfo)
    private guestInfoRepo: Repository<GuestInfo>,
    @InjectRepository(GuestDate)
    private guestDateRepo: Repository<GuestDate>,
    private readonly socketGateWay: SocketGateway,
    @Inject(forwardRef(() => DiscordService))
    private discorService: DiscordService,
  ) {}

  formatDate(inputDate: any) {
    // Chia chuỗi ngày thành mảng gồm ngày, tháng và năm
    const parts = inputDate.split('/');

    // Tạo định dạng mới với thứ tự y/m/d
    const formattedDate = parts[2] + '/' + parts[1] + '/' + parts[0];

    return formattedDate;
  }
  async all(body, request, res) {
    let statusRq = body?.status;
    if (!statusRq) {
      statusRq = 'ALL';
    }
    if (body?.date && request?.user?.role?.ROLE_NAME) {
      switch (request?.user?.role?.ROLE_NAME) {
        case 'SECURITY':
          // security
          const dates = JSON.parse(body?.date);
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
                DATE: In(dates),
              },
              STATUS:
                statusRq === STATUS_ENUM.NEW
                  ? STATUS_ENUM.ACCEPT
                  : In([STATUS_ENUM.ACCEPT, STATUS_ENUM.COME_IN]),
            },
            relations: ['guest_info'],
            order: { TIME_IN: 'ASC' },
          });
          return res.status(HttpStatus.OK).send(data);
          break;
        case 'ADMIN':
          // admin
          const dateArr = JSON.parse(body?.date)?.map((item) => {
            return this.formatDate(item);
          });
          let text = `CAST(guest.CREATE_AT AS DATE) IN (:...dateArr) AND guest.DELETE_AT IS NULL`;
          if (statusRq === STATUS_ENUM.NEW) {
            text += ` AND guest.STATUS = '${STATUS_ENUM.NEW}'`;
          } else {
            text = `CAST(guest.CREATE_AT AS DATE) IN (:...dateArr) AND guest.DELETE_AT IS NULL`;
          }
          const records = await this.guestRepo
            .createQueryBuilder('guest')
            .where(text, {
              dateArr,
            })
            .leftJoinAndSelect('guest.guest_info', 'guest_info')
            .orderBy('guest.TIME_IN', 'ASC')
            .getMany();
          return res.status(HttpStatus.OK).send(records);
          break;
        case 'USER':
          const dateWhere = JSON.parse(body?.date)?.map((date) => {
            return this.formatDate(date);
          });
          const result = await this.guestRepo
            .createQueryBuilder('guest')
            .where(
              `CAST(guest.CREATE_AT AS DATE) IN (:...dateWhere) AND guest.CREATE_BY = '${request?.user?.username}'`,
              {
                dateWhere,
              },
            )
            .leftJoinAndSelect('guest.guest_info', 'guest_info')
            .getMany();
          return res.status(HttpStatus.OK).send(result);
          // if (request?.user?.username) {
          //   const dateBody = JSON.parse(body?.date);
          //   const data = await this.guestRepo.find({
          //     select: {
          //       GUEST_ID: true,
          //       TIME_IN: true,
          //       TIME_OUT: true,
          //       COMPANY: true,
          //       PERSON_SEOWON: true,
          //       STATUS: true,
          //       CREATE_AT: true,
          //       guest_info: {
          //         FULL_NAME: true,
          //       },
          //       guest_date: {
          //         DATE: true,
          //       },
          //     },
          //     where: {
          //       DELETE_AT: null,
          //       CREATE_BY: request?.user?.username,
          //       CREATE_AT: In(dateBody),
          //     },
          //     relations: ['guest_info'],
          //     order: { CREATE_AT: 'DESC' },
          //   });
          //   return res.status(HttpStatus.OK).send(data);
          // }

          break;

        default:
          break;
      }
      //user: danh sách đã đăng ký của bản thân
      //người duyệt:danh sách khách đăng ký hôm nay
      //security:danh sách đã duyệt hôm nay

      // ==========================================
      // USER
    }
  }

  // async all(body, request, res) {
  //   console.log('user', request?.user);
  //   let arr = [];
  //   const user = request?.user;
  //   if (body?.date) {
  //     arr = JSON.parse(body?.date);
  //   }
  //   let where = {};
  //   if (user?.role?.ROLE_NAME === 'SECURITY') {
  //     where = {
  //       DELETE_AT: null,
  //       guest_date: {
  //         DATE: In(arr),
  //       },
  //       STATUS: STATUS_ENUM.ACCEPT,
  //     };
  //   }
  //   if (user?.role?.ROLE_NAME === 'ADMIN') {
  //     where = {
  //       DELETE_AT: null,
  //       CREATE_AT: In(arr),
  //     };
  //   }
  //   if (user?.role?.ROLE_NAME === 'USER') {
  //     where = {
  //       DELETE_AT: null,
  //       CREATE_AT: In(arr),
  //       CREATE_BY: user?.username,
  //     };
  //   }

  //   const data = await this.guestRepo.find({
  //     select: {
  //       GUEST_ID: true,
  //       TIME_IN: true,
  //       TIME_OUT: true,
  //       COMPANY: true,
  //       PERSON_SEOWON: true,
  //       STATUS: true,
  //       guest_info: {
  //         FULL_NAME: true,
  //       },
  //       guest_date: {
  //         DATE: true,
  //       },
  //     },
  //     where: where,
  //     relations: ['guest_info', 'guest_date'],
  //     order: { TIME_IN: 'ASC' },
  //   });
  //   return res.status(HttpStatus.OK).send(data);
  // }
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
        if (item?.isShow && item?.FULL_NAME) {
          const newGuesInfo = new GuestInfo();
          newGuesInfo.FULL_NAME = item.FULL_NAME;
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
      if (savedGuest) {
        res.status(HttpStatus.OK).send(savedGuest);
        console.log('savedGuest', savedGuest);
        this.socketGateWay.sendNewGuestNotification(savedGuest);
        const ID = `\nMã: ${savedGuest.GUEST_ID}`;
        const dates = concatDateString(savedGuest?.guest_date);
        const line = '-----------------------------';
        const time = `\nThời gian: ${formatHourMinus(savedGuest?.TIME_IN)}-${formatHourMinus(savedGuest?.TIME_OUT)} ${dates}`;
        const guest = `\nTên khách: ${concatGuestInfo(savedGuest?.guest_info)}`;
        const carNumber = savedGuest?.CAR_NUMBER
          ? ` - (${savedGuest?.CAR_NUMBER})`
          : '';
        const company = `\nCông ty: ${savedGuest?.COMPANY}${carNumber}`;
        const reason = `\nLý do: ${savedGuest?.REASON}`;
        const personSeowon = `\nNgười bảo lãnh: ${savedGuest?.PERSON_SEOWON}`;
        const department = `\nBộ phận: ${savedGuest?.DEPARTMENT}\n`;
        await this.discorService.sendMessage(
          line +
            ID +
            time +
            guest +
            company +
            reason +
            personSeowon +
            department +
            line,
        );
        return;
      }
    } catch (error) {
      console.log('error', error);
    }
    return res.status(HttpStatus.BAD_REQUEST).send({ message: 'Insert fail!' });
  }
  async update(body, request, res) {
    const newGuest = new Guest();
    newGuest.GUEST_ID = body?.id;
    newGuest.TIME_IN = body?.timeIn;
    newGuest.TIME_OUT = body?.timeOut;
    newGuest.COMPANY = body?.company;
    newGuest.CAR_NUMBER = body?.carNumber;
    newGuest.PERSON_SEOWON = body?.personSeowon;
    newGuest.DEPARTMENT = body?.department;
    newGuest.REASON = body?.reason;
    newGuest.UPDATE_BY = request?.user?.username;
    newGuest.UPDATE_AT = new Date();
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
    if (body?.names) {
      const arrID = [];
      const arrInsert = [];
      body.names.map((row) => {
        if (row?.NAME_ID && row?.isShow === false) {
          arrID.push(row?.NAME_ID);
        }
        if (row?.isShow === true) {
          const dataUpdate = new GuestInfo();
          if (row?.NAME_ID) {
            dataUpdate.NAME_ID = row.NAME_ID;
          } else {
            delete dataUpdate.NAME_ID;
          }
          dataUpdate.FULL_NAME = row?.FULL_NAME;
          arrInsert.push(dataUpdate);
        }
      });
      newGuest.guest_info = arrInsert;
    }
    if (body?.date) {
      const arrNewDate = [];
      body.date.map((dateItem) => {
        const newDate = new GuestDate();
        newDate.DATE = dateItem;
        arrNewDate.push(newDate);
      });
      newGuest.guest_date = arrNewDate;
    }
    try {
      await this.guestDateRepo.delete({
        guest: { GUEST_ID: body?.id },
      });
      const savedGuest = await this.guestRepo.save(newGuest);
      return res.status(HttpStatus.OK).send(savedGuest);
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).send(error);
    }
  }

  async delete(body, request, res) {
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
  async changeStatus(body, request, res) {
    const data = body?.GUEST_ID;
    const role = request?.user?.role?.ROLE_NAME;
    if (data && role) {
      const dataUpdate = new Guest();
      dataUpdate.GUEST_ID = data;
      dataUpdate.UPDATE_AT = new Date();
      dataUpdate.UPDATE_BY = request?.user?.username;
      if (role === 'ADMIN') {
        dataUpdate.STATUS = STATUS_ENUM.ACCEPT;
      } else if (role === 'SECURITY') {
        dataUpdate.STATUS = STATUS_ENUM.COME_IN;
      }
      const result = await this.guestRepo.save(dataUpdate);
      this.socketGateWay.onAcceptGuestNotification(dataUpdate);
      res.status(HttpStatus.OK).send(result);
      await this.discorService.addReactMessage(result?.GUEST_ID);
      return;
    }
    return res
      .status(HttpStatus.BAD_REQUEST)
      .send({ message: 'Cannot found ID!' });
  }
  async onCancel(body, request, res) {
    const data = body?.GUEST_ID;
    const role = request?.user?.role?.ROLE_NAME;
    if (data && role) {
      if (role === 'ADMIN') {
        const dataUpdate = new Guest();
        dataUpdate.GUEST_ID = data;
        dataUpdate.UPDATE_AT = new Date();
        dataUpdate.UPDATE_BY = request?.user?.username;
        dataUpdate.STATUS = STATUS_ENUM.CANCEL;
        const result = await this.guestRepo.save(dataUpdate);
        this.socketGateWay.onAcceptGuestNotification(dataUpdate);
        return res.status(HttpStatus.OK).send(result);
        // await this.discorService.addReactMessage(result?.GUEST_ID);
        // return;
      }
    }
    return res
      .status(HttpStatus.BAD_REQUEST)
      .send({ message: 'Cannot found ID!' });
  }

  async changeStatusFromDiscord(id, user) {
    if (id && user) {
      const guest = await this.guestRepo.findOne({ where: { GUEST_ID: id } });
      if (guest) {
        if (guest?.STATUS === STATUS_ENUM.NEW) {
          guest.STATUS = STATUS_ENUM.ACCEPT;
          guest.UPDATE_AT = new Date();
          guest.UPDATE_BY = user;
          await this.guestRepo.save(guest);
          this.socketGateWay.onAcceptGuestNotification(guest);
          return guest;
        }
        // trường hợp đã có trạng thái rồi , nhưng vẫn ấn reaction;
        return true;
      }
    }
    return null;
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
