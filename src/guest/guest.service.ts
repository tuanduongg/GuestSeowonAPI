import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, Like } from 'typeorm';
import { Guest } from 'src/entity/guest.entity';
import { GuestInfo } from 'src/entity/guest_info.entity';
import { GuestDate } from 'src/entity/guest_date.entity';

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
    const data = await this.guestRepo.find({
      where: { DELETE_AT: null },
      relations: ['guest_info', 'guest_date'],
      order: { TIME_IN: 'ASC' },
    });
    // const take = +body.rowsPerPage || 10;
    // const page = +body.page || 0;
    // const search = body.search || '';
    // const skip = page * take;
    // const [result, total] = await this.guestRepo.findAndCount({
    //   where: {
    //     userID: Not(request?.user?.id),
    //     delete_at: null,
    //     username: Like('%' + search + '%'),
    //   },
    //   relations: ['department'],
    //   select: [
    //     'userID',
    //     'username',
    //     'isManager',
    //     'email',
    //     'created_at',
    //     'updated_at',
    //     'delete_at',
    //     'updated_by',
    //     'deleted_by',
    //     'isApprover',
    //   ],
    //   take: take,
    //   skip: skip,
    // });

    // return {
    //   data: result,
    //   count: total,
    // };
    return res.status(HttpStatus.OK).send(data);
  }

  async add(body, request,res) {
    console.log('body', body);
    return 'add';
  }

  // async edit(body, request) {
  //   const checkUsername = await this.guestRepo.findOne({
  //     where: { userID: body?.userID },
  //   });
  //   if (checkUsername) {
  //     checkUsername.email = body?.email ?? null;
  //     checkUsername.departmentID = body?.departmentID;
  //     if (body?.password) {
  //       const passHasd = await bcrypt.hash(
  //         body?.password,
  //         parseInt(process.env.ROUND_SALT) || 10,
  //       );
  //       checkUsername.password = passHasd;
  //     }
  //     checkUsername.isManager = body?.isManager ?? false;
  //     checkUsername.updated_by = request?.user?.username;
  //     const { password, ...user } = await this.guestRepo.save(checkUsername);
  //     return user;
  //   }
  //   return null;
  // }

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
