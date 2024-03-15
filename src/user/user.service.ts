import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entity/user.entity';
import { Repository, Not, Like } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role } from 'src/entity/role.entity';

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
      where: { USERNAME: username },
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

  async add(body, request, res) {
    const passHasd = await bcrypt.hash(
      body?.PASSWORD,
      parseInt(process.env.ROUND_SALT) || 10,
    );
    const user = await this.userRepo.save({
      USERNAME: body?.USERNAME,
      PASSWORD: passHasd,
      CREATE_AT: new Date(),
      CREATE_BY: request?.user?.username,
      ACTIVE: body?.ACTIVE,
      role: body?.role,
    });
    if (user) {
      return res.status(HttpStatus.OK).send(user);
    }
    return res
      .status(HttpStatus.BAD_REQUEST)
      .send({ message: 'Add user fail!' });
  }
  async edit(body, request, res) {
    if (body?.USER_ID) {
      const userFind = await this.userRepo.findOne({
        where: { USER_ID: body?.USER_ID },
      });
      if (userFind) {
        if (body?.PASSWORD) {
          const passHasd = await bcrypt.hash(
            body?.PASSWORD,
            parseInt(process.env.ROUND_SALT) || 10,
          );
          userFind.PASSWORD = passHasd;
        }
        userFind.role = body?.role;
        userFind.ACTIVE = body?.ACTIVE;
        userFind.UPDATE_AT = new Date();
        userFind.UPDATE_BY = request?.user?.username;
        await this.userRepo.save(userFind);
        return res.status(HttpStatus.OK).send(userFind);
      }
    }
    return res
      .status(HttpStatus.BAD_REQUEST)
      .send({ message: 'Add user fail!' });
  }

  async changeBlock(body, request, res) {
    const type = body?.type;
    const ids = body?.listID;
    if (type) {
      return res.status(HttpStatus.OK).send(type);
    }
    return res.status(HttpStatus.BAD_REQUEST).send({ message: 'Change fail!' });
  }
  async all(body, request, res) {
    const data = await this.userRepo.find({
      where: {
        DELETE_AT: null,
      },
      relations: ['role'],
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
