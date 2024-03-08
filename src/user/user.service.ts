import { Injectable } from '@nestjs/common';
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

  async all(body, request) {
    // const take = +body.rowsPerPage || 10;
    // const page = +body.page || 0;
    // const search = body.search || '';
    // const skip = page * take;
    // const [result, total] = await this.userRepo.findAndCount({
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
    return '1';
  }

  // async add(body, request) {
  //   const passHasd = await bcrypt.hash(
  //     body?.password,
  //     parseInt(process.env.ROUND_SALT) || 10,
  //   );
  //   const userSave = {
  //     username: body?.username,
  //     departmentID: body?.departmentID,
  //     email: body?.email ?? null,
  //     password: passHasd,
  //     isManager: body?.isManager ?? false,
  //   };
  //   const checkUsername = await this.userRepo.findOne({
  //     where: { username: body?.username },
  //   });
  //   if (checkUsername) {
  //     return 'Username already exists';
  //   }
  //   const user = await this.userRepo.insert(userSave);
  //   if (user.raw && user.raw.length > 0) {
  //     return user;
  //   }
  //   return null;
  // }

  // async edit(body, request) {
  //   const checkUsername = await this.userRepo.findOne({
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
  //     const { password, ...user } = await this.userRepo.save(checkUsername);
  //     return user;
  //   }
  //   return null;
  // }

  async fake() {
    const user = await this.userRepo.insert({
      USERNAME: 'admin',
      PASSWORD: '$2b$10$ZcmO79s.BYP1z7V5NGV9VOknlMh7v2yxMrgeu1Jb.xfirZ/pLk8tq',
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
