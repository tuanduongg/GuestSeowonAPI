import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entity/user.entity';
import { Repository, Not, Like } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}
  getHello(): string {
    return 'Hello World!!!!!!';
  }
  async findByUsername(username) {
    const userName = await this.userRepo.findOne({
      select: {
        USER_ID: true,
        USERNAME: true,
        EMAIL: true,
        PASSWORD: true,
        role: {
          ROLE_ID: true,
          ROLE_NAME: true,
        },
      },
      where: { USERNAME: username},
      relations: ['role'],
    });
    return userName;
  }
  async getUser(request) {
    const userID = request?.user?.id;
    const user = await this.userRepo.findOneOrFail({
      where: { USER_ID: userID },
    });
    return user;
  }

  async all(body, request, res) {
    const data = await this.userRepo.find({
      where: {
        DELETE_AT: null,
      },
      relations: ['role'],
      // select: ['USER_ID', 'USERNAME', 'role.ROLE_ID'],
      // select: {
      //   USER_ID: true,
      //   USERNAME: true,
      //   CREATE_AT: true,
      //   role: {
      //     ROLE_ID: true,
      //     ROLE_NAME: true,
      //   },
      // },
    });
    if (data) {
      const dataRS = data.map((item) => {
        delete item.PASSWORD;
        return item;
      });
      return res.status(HttpStatus.OK).send(dataRS);
    }
    return res
      .status(HttpStatus.BAD_REQUEST)
      .send({ message: 'Get data fail!' });
    // const [result, total] = await this.userRepo.findAndCount({
    //   where: {
    //     DELETE_AT: null,
    //   },
    //   relations: ['role'],
    //   select: ['USER_ID', 'USERNAME', 'role.ROLE_NAME'],
    //   take: take,
    //   skip: skip,
    // });

    // return {
    //   data: result,
    //   count: total,
    // };
    return '1';
  }

  async fake() {
    const user = await this.userRepo.insert({
      USERNAME: 'admin',
      PASSWORD: '$2b$10$ZcmO79s.BYP1z7V5NGV9VOknlMh7v2yxMrgeu1Jb.xfirZ/pLk8tq',
      role: { ROLE_ID: 'A747433E-F36B-1410-80D8-00368CCD0EB0' },
    });
    return user;
  }
  // async test() {
  //   const user = await this.userRepo.save({
  //     userID: '8CCF9405-FAB8-EE11-A1CA-04D9F5C9D2EB',
  //     isApprover: true,
  //   });
  //   return user;
  // }
}
