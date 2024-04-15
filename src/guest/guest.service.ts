import { HttpStatus, Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Guest } from 'src/entity/guest.entity';
import { GuestInfo } from 'src/entity/guest_info.entity';
import { GuestDate } from 'src/entity/guest_date.entity';
import { STATUS_ENUM } from 'src/enum/status.enum';
import { SocketGateway } from 'src/socket/socket.gateway';
import { formatDateHourMinus, getCurrentDate, getMinMaxDateString, templateInBox } from 'src/helper';
import { DiscordService } from 'src/discord/discord.service';
import { HistoryGuestService } from 'src/history_guest/history_guest.service';
import * as ExcelJS from 'exceljs';
import * as stream from 'stream';

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

    private readonly historyGuestService: HistoryGuestService,

    @Inject(forwardRef(() => DiscordService))
    private discorService: DiscordService,
  ) { }

  formatDate(inputDate: any) {
    // Chia chuỗi ngày thành mảng gồm ngày, tháng và năm
    const parts = inputDate.split('/');

    // Tạo định dạng mới với thứ tự y/m/d
    const formattedDate = parts[2] + '/' + parts[1] + '/' + parts[0];

    return formattedDate;
  }
  async all(body, request, res) {
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
              STATUS: In([STATUS_ENUM.ACCEPT, STATUS_ENUM.COME_IN]),
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
          const records = await this.guestRepo
            .createQueryBuilder('guest')
            .where(`CAST(guest.CREATE_AT AS DATE) IN (:...dateArr)`, {
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
            .orderBy('guest.CREATE_AT', 'DESC')
            .getMany();
          return res.status(HttpStatus.OK).send(result);

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

  async checkNewGuest(body, request, res) {
    if (request?.user?.role?.ROLE_NAME) {
      switch (request?.user?.role?.ROLE_NAME) {
        case 'SECURITY':
          const data = await this.guestRepo
            .createQueryBuilder('guest')
            .leftJoinAndSelect('guest.guest_info', 'guest_info')
            .leftJoinAndSelect(
              'guest.histories',
              'histories',
              'histories.TYPE = :type AND histories.VALUE = :value AND CAST(histories.TIME AS DATE) = CAST(GETDATE() AS DATE) ',
              { type: 'UPDATE', value: STATUS_ENUM.COME_IN },
            )
            .leftJoin('guest.guest_date', 'guest_date')
            .where('guest.DELETE_AT IS NULL')
            .andWhere('guest_date.DATE = :currentDate', {
              currentDate: getCurrentDate(),
            })
            .andWhere('guest.STATUS NOT IN (:...statuses)', {
              statuses: [STATUS_ENUM.NEW, STATUS_ENUM.CANCEL],
            })
            .orderBy("FORMAT(guest.TIME_IN, 'HH:mm')", 'ASC')
            .getMany();
          return res.status(HttpStatus.OK).send(data);

        default:
          const dateInputs = [this.formatDate(getCurrentDate())];
          const result = await this.guestRepo
            .createQueryBuilder('guest')
            .withDeleted()
            .where(
              `CAST(guest.CREATE_AT AS DATE) IN (:...dateInputs) AND guest.STATUS = '${STATUS_ENUM.NEW}'`,
              {
                dateInputs,
              },
            )
            .leftJoinAndSelect('guest.guest_info', 'guest_info')
            .orderBy('guest.TIME_IN', 'ASC')
            .getMany();
          return res.status(HttpStatus.OK).send(result);
      }
    }
    return res.status(HttpStatus.OK).send([]);
  }

  async findByID(body, request, res) {
    if (body?.id) {
      const data = await this.guestRepo.findOne({
        withDeleted: true,
        where: {
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
    if (request?.user?.permission?.IS_ACCEPT) {
      newGuest.STATUS = STATUS_ENUM.ACCEPT;
    }
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
        await this.historyGuestService.add(
          {
            TYPE: 'CREATE',
            VALUE: 'CREATED',
          },
          [savedGuest.GUEST_ID],
          request?.user?.username,
        );
        res.status(HttpStatus.OK).send(savedGuest);
        try {
          this.socketGateWay.sendNewGuestNotification(savedGuest);
          if (savedGuest.STATUS == STATUS_ENUM.ACCEPT) {
            await this.discorService.sendMessage(
              templateInBox(savedGuest),
              '👍',
            );
          } else {
            await this.discorService.sendMessage(templateInBox(savedGuest));
          }
        } catch (error) {
          console.log(error);
        }
        return;
      }
    } catch (error) {
      console.log('error on add guest', error);
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
      res.status(HttpStatus.OK).send(savedGuest);
      await this.historyGuestService.add(
        {
          TYPE: 'UPDATE',
          VALUE: 'UPDATE INFORMATION',
        },
        [savedGuest.GUEST_ID],
        request?.user?.username,
      );
      await this.discorService.onEditMessage(savedGuest);
      return;
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).send(error);
    }
  }

  async delete(body, request, res) {
    const data = body?.data;
    if (data) {
      const dataUpdate = data.map((item) => {
        return {
          STATUS: STATUS_ENUM.CANCEL,
          GUEST_ID: item,
          DELETE_AT: new Date(),
          DELETE_BY: request?.user?.username,
        };
      });
      const result = await this.guestRepo.save(dataUpdate);
      res.status(HttpStatus.OK).send(result);
      await this.historyGuestService.add(
        {
          TYPE: 'UPDATE',
          VALUE: 'CANCEL',
        },
        [result.GUEST_ID],
        request?.user?.username,
      );
      return;
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
      if (role === 'SECURITY') {
        dataUpdate.STATUS = STATUS_ENUM.COME_IN;
      } else {
        dataUpdate.STATUS = STATUS_ENUM.ACCEPT;
      }
      const result = await this.guestRepo.save(dataUpdate);
      this.socketGateWay.onAcceptGuestNotification(dataUpdate);
      await this.historyGuestService.add(
        {
          TYPE: 'UPDATE',
          VALUE: result?.STATUS,
        },
        [data],
        request?.user?.username,
      );
      res.status(HttpStatus.OK).send(result);
      await this.discorService.addReactMessage([result?.GUEST_ID], '👍');
      return;
    }
    return res
      .status(HttpStatus.BAD_REQUEST)
      .send({ message: 'Cannot found ID!' });
  }
  async onCancel(body, request, res) {
    const data = body?.data;
    if (data) {
      const dataUpdate = data.map((item) => {
        return {
          STATUS: STATUS_ENUM.CANCEL,
          GUEST_ID: item,
        };
      });
      const result = await this.guestRepo.save(dataUpdate);
      res.status(HttpStatus.OK).send(result);
      this.socketGateWay.onAcceptGuestNotification(dataUpdate);
      await this.historyGuestService.add(
        {
          TYPE: 'UPDATE',
          VALUE: 'CANCEL',
        },
        data,
        request?.user?.username,
      );
      await this.discorService.addReactMessage(
        result?.map((guestItem) => guestItem?.GUEST_ID),
        '❌',
      );
      return;
    }
    return res
      .status(HttpStatus.BAD_REQUEST)
      .send({ message: 'Cannot found ID!' });
  }
  private getColumnLetter(columnNumber) {
    let dividend = columnNumber;
    let columnName = '';
    let modulo;

    while (dividend > 0) {
      modulo = (dividend - 1) % 26;
      columnName = String.fromCharCode(65 + modulo) + columnName;
      dividend = Math.floor((dividend - modulo) / 26);
    }

    return columnName;
  }
  private joinColumn(arr: any) {
    return arr.join('/n');
  }

  /**
   *
   * @param arr:array string guest ID
   * @returns array guest
   */
  async findByArrId(arr: string[]) {
    const data = await this.guestRepo.find({
      withDeleted: true,
      where: {
        GUEST_ID: In(arr),
      },
      relations: ['guest_info', 'guest_date'],
    });
    return data;
  }
  //nếu là ngày liên tục thì sao?-> lấy ngày bé nhất -> ngày lớn nhất

  async onExport(body, res) {
    const listID = body?.listID ?? [];
    if (listID?.length > 0) {
      const dataGuest = await this.findByArrId(listID);
      const arrRs = [];
      if (dataGuest?.length > 0) {
        dataGuest.map((guest, index) => {
          let dateString = '';
          // nếu mà vào nhiều ngày thì show dạng min - max
          if (guest?.guest_date?.length > 1) {
            const arrDates = guest?.guest_date.map((date) => date.DATE);
            const minMaxDate = getMinMaxDateString(arrDates);
            dateString = (`${minMaxDate.minDate} ~ ${minMaxDate.maxDate}`);
          } else {
            dateString = `${guest?.guest_date[0].DATE}`;
          }
          const arrGuest = [];
          guest?.guest_info?.map((nameGuest, num) => {
            const arrItem = [];
            arrItem.push(num + 1)
            arrItem.push(dateString);
            arrItem.push(nameGuest?.FULL_NAME);
            arrItem.push(guest?.CAR_NUMBER);
            arrItem.push(guest?.COMPANY);
            arrItem.push(guest?.REASON);
            arrItem.push(formatDateHourMinus(guest?.TIME_IN));
            arrItem.push(formatDateHourMinus(guest?.TIME_OUT));
            arrItem.push(guest?.PERSON_SEOWON);
            arrItem.push(guest?.DEPARTMENT);
            arrGuest.push(arrItem);
          })
          arrRs.push({ sheetName: `Sheet ${index + 1}`, data: arrGuest });
        });
      }
      const workbook = new ExcelJS.Workbook();
      if (arrRs.length > 0) {
        arrRs.map((sheetItem) => {
          const sheet = workbook.addWorksheet(sheetItem.sheetName);
          const data = sheetItem.data;

          // Merge cells and set header
          sheet.mergeCells('B2:K3');
          const mergedCell = sheet.getCell('B2');
          mergedCell.value = 'QUẢN LÝ ĐĂNG KÝ GẶP KHÁCH HẰNG NGÀY';
          mergedCell.font = { name: 'Times New Roman', size: 13, bold: true };
          mergedCell.alignment = { vertical: 'middle', horizontal: 'center' };

          // Set column headers
          const headers = [
            'STT',
            `Ngày(날짜)`,
            'Tên Khách(방문자 이름)',
            'Biển số xe(차량번호)',
            'Công ty(소속 회사)',
            'Lý do(방문 내용 및사유)',
            'Giờ đến(입문 예상 시간)',
            'Giờ về(출문 예상 시간)',
            'Người bảo lãnh(담당자)',
            'Bộ phận(방문 부서)',
          ];
          for (let i = 0; i < headers.length; i++) {
            const cell = sheet.getCell(this.getColumnLetter(i + 2) + '5'); // Starting from B5
            cell.value = Array.isArray(headers[i])
              ? this.joinColumn(headers[i])
              : headers[i];
            cell.font = { name: 'Times New Roman', size: 10, bold: true };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' },
            };
          }

          // Insert data
          for (let i = 0; i < data.length; i++) {
            const rowData = data[i];
            const rowIndex = i + 6; // Starting from row 6
            for (let j = 0; j < rowData.length; j++) {
              const columnIndex = j + 2; // Starting from column B
              const cell = sheet.getCell(
                this.getColumnLetter(columnIndex) + rowIndex.toString(),
              );
              cell.value = rowData[j];
              cell.alignment = { vertical: 'middle', horizontal: 'center' };
              cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' },
              };
            }
          }
          // Auto fit column widths
          for (let i = 2; i <= 11; i++) {
            sheet.getColumn(i).eachCell((cell) => {
              if (cell.value) {
                const column = sheet.getColumn(i);
                column.width = 20;
              }
            });
          }
        });
      } else {
        return null;
      }
      // await res.send(dataRs);
      const streamOutput = new stream.PassThrough();
      workbook.xlsx.write(streamOutput).then(() => {
        streamOutput.end();
      });
      return streamOutput;
    } else {
      return res.status(HttpStatus.BAD_REQUEST).send({ message: 'Export fail!' });
    }
  }

  async cancelFromDiscord(ID, userDiscord) {
    if (ID && userDiscord) {
      const dataUpdate = await this.guestRepo.findOne({
        where: {
          GUEST_ID: ID,
        },
      });
      if (dataUpdate && dataUpdate?.STATUS !== STATUS_ENUM.CANCEL) {
        dataUpdate.STATUS = STATUS_ENUM.CANCEL;
        const pro1 = this.guestRepo.save(dataUpdate);
        const pro2 = this.historyGuestService.add(
          {
            TYPE: 'UPDATE',
            VALUE: 'CANCEL',
          },
          [ID],
          userDiscord,
        );
        const all = await Promise.all([pro1, pro2]);
        this.socketGateWay.onAcceptGuestNotification(dataUpdate);
        return all;
      }
    }
    return null;
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
          await this.historyGuestService.add(
            {
              TYPE: 'UPDATE',
              VALUE: guest.STATUS,
            },
            [id],
            user,
          );
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
