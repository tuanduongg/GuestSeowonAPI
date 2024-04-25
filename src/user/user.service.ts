import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entity/user.entity';
import { In, Like, Not, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Department } from 'src/entity/department.entity';

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
      where: { USERNAME: username, ACTIVE: true },
      relations: ['role', 'department'],
    });
    return userName;
  }
  async getById(id: string) {
    const user = await this.userRepo.findOneOrFail({
      where: { USER_ID: id },
      relations: ['department'],
    });
    return user;
  }
  async getUserFromRequest(request) {
    const userID = request?.user?.id;
    const user = await this.userRepo.findOneOrFail({
      where: { USER_ID: userID },
    });
    return user;
  }
  async getUserByToken(token: string) {
    const user = await this.userRepo.findOne({ where: { TOKEN: token } });
    return user;
  }
  async saveToken(token: string, user: User) {
    user.TOKEN = token;
    return await this.userRepo.save(user);
  }

  async add(body, request, res) {
    const passHasd = await bcrypt.hash(
      body?.PASSWORD,
      parseInt(process.env.ROUND_SALT) || 10,
    );
    const department = new Department();
    department.departID = body?.deparmentID;
    const user = await this.userRepo.save({
      USERNAME: body?.USERNAME,
      PASSWORD: passHasd,
      CREATE_AT: new Date(),
      CREATE_BY: request?.user?.username,
      ACTIVE: body?.ACTIVE,
      role: body?.role,
      department: department,
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
        const department = new Department();
        department.departID = body?.deparmentID;
        userFind.department = department;
        await this.userRepo.save(userFind);
        return res.status(HttpStatus.OK).send(userFind);
      }
    }
    return res
      .status(HttpStatus.BAD_REQUEST)
      .send({ message: 'Add user fail!' });
  }
  async changePassword(body, request, res) {
    const userId = request?.user?.id;
    if (userId) {
      const { currentPassword, newPassword } = body;
      const userFind = await this.userRepo.findOne({
        where: { USER_ID: userId },
      });
      if (userFind) {
        const compare = await bcrypt.compareSync(
          currentPassword,
          userFind.PASSWORD,
        );
        if (compare) {
          const passHasd = await bcrypt.hash(
            newPassword,
            parseInt(process.env.ROUND_SALT) || 10,
          );
          userFind.PASSWORD = passHasd;
          const result = await this.userRepo.save(userFind);
          return res.status(HttpStatus.OK).send(result);
        }
        return res
          .status(HttpStatus.BAD_REQUEST)
          .send({ message: 'Mật khẩu hiện tại không đúng!' });
      }
    }
    return res
      .status(HttpStatus.BAD_REQUEST)
      .send({ message: 'Không tìm thấy tài khoản!' });
  }

  async changeBlock(body, request, res) {
    const type = body?.type;
    const ids = body?.listID;
    if (type && ids && ids?.length > 0) {
      const arrUpdate = [];
      ids.map((item) => {
        if (item) {
          const newUser = new User();
          newUser.USER_ID = item;
          newUser.UPDATE_AT = new Date();
          newUser.UPDATE_BY = request?.user?.username;
          if (type === 'BLOCK') {
            newUser.ACTIVE = false;
          } else {
            newUser.ACTIVE = true;
          }
          arrUpdate.push(newUser);
        }
      });
      const saved = await this.userRepo.save(arrUpdate);
      return res.status(HttpStatus.OK).send(saved);
    }

    return res.status(HttpStatus.BAD_REQUEST).send({ message: 'Change fail!' });
  }
  async all(body, request, res) {
    const search = body?.search ?? '';
    const idCurrentUser = request?.user?.id;
    if (idCurrentUser) {
      const data = await this.userRepo.find({
        where: {
          USERNAME: Like(`%${search}%`),
          DELETE_AT: null,
          USER_ID: Not(In([idCurrentUser])),
        },
        relations: ['role', 'department'],
      });
      if (data) {
        const dataRS = data.map((item) => {
          delete item.PASSWORD;
          return item;
        });
        return res.status(HttpStatus.OK).send(dataRS);
      }
    }
    return res
      .status(HttpStatus.BAD_REQUEST)
      .send({ message: 'Get data fail!' });
  }
  async logout(request, res) {
    const id = request?.user?.id;
    if (id) {
      const user = await this.userRepo.findOne({
        where: { USER_ID: id },
      });
      if (user) {
        user.TOKEN = null;
        await this.userRepo.save(user);
        return res.status(HttpStatus.OK).send({ message: 'Logout successful' });
      }
    }
    return res.status(HttpStatus.BAD_REQUEST).send({ message: 'Logout fail' });
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
