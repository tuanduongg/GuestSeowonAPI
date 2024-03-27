import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entity/user.entity';
import { Repository } from 'typeorm';
import { Role } from 'src/entity/role.entity';
import { Permisstion } from 'src/entity/permission.entity';
import { ListAPI } from 'src/entity/listapi.entity';

@Injectable()
export class MigrateService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Permisstion)
    private permisRepo: Repository<Permisstion>,
    @InjectRepository(Role)
    private roleRepo: Repository<Role>,
    @InjectRepository(ListAPI)
    private listAPIRepo: Repository<ListAPI>,
  ) {}
  getHello(): string {
    return 'Hello World!!!!!!';
  }

  async fake() {
    const role = await this.roleRepo.save([
      {
        ROLE_NAME: 'SECURITY',
        ROLE_ID: 'f6dc7a68-b1d9-ee11-a1db-08bfb89bcbb5',
      },
      { ROLE_NAME: 'USER', ROLE_ID: 'fa60d4a3-77da-ee11-a1db-08bfb89bcbb5' },
      { ROLE_NAME: 'ADMIN', ROLE_ID: '5fe20cec-62bb-ee11-a1cb-b5b416639ec5' },
    ]);

    const permis = await this.permisRepo.save([
      {
        SCREEN: 'LIST_GUEST',
        IS_READ: true,
        IS_CREATE: true,
        IS_UPDATE: true,
        IS_DELETE: true,
        IS_ACCEPT: true,
        ROLE: '5fe20cec-62bb-ee11-a1cb-b5b416639ec5',
      },
      {
        SCREEN: 'USER',
        IS_READ: true,
        IS_CREATE: true,
        IS_UPDATE: true,
        IS_DELETE: true,
        IS_ACCEPT: true,
        ROLE: '5fe20cec-62bb-ee11-a1cb-b5b416639ec5',
      },
      {
        SCREEN: 'LIST_GUEST',
        IS_READ: true,
        IS_CREATE: true,
        IS_UPDATE: true,
        IS_DELETE: false,
        IS_ACCEPT: false,
        ROLE: 'fa60d4a3-77da-ee11-a1db-08bfb89bcbb5',
      },
      {
        SCREEN: 'USER',
        IS_READ: false,
        IS_CREATE: false,
        IS_UPDATE: false,
        IS_DELETE: false,
        IS_ACCEPT: false,
        ROLE: 'fa60d4a3-77da-ee11-a1db-08bfb89bcbb5',
      },
      {
        SCREEN: 'LIST_GUEST',
        IS_READ: true,
        IS_CREATE: false,
        IS_UPDATE: false,
        IS_DELETE: false,
        IS_ACCEPT: true,
        ROLE: 'f6dc7a68-b1d9-ee11-a1db-08bfb89bcbb5',
      },
      {
        SCREEN: 'USER',
        IS_READ: false,
        IS_CREATE: false,
        IS_UPDATE: false,
        IS_DELETE: false,
        IS_ACCEPT: false,
        ROLE: 'f6dc7a68-b1d9-ee11-a1db-08bfb89bcbb5',
      },
    ]);

    const newUser = new User();
    newUser.ACTIVE = true;
    newUser.USERNAME = 'TuanIT';
    newUser.PASSWORD =
      '$2b$10$S97UADJxAdrAQn9OOCCzT.ZQ7pPDIE2oN6FJEUHNeTrA0U8xGBClO';
    const roleNew = new Role();
    roleNew.ROLE_ID = '5fe20cec-62bb-ee11-a1cb-b5b416639ec5';
    newUser.role = roleNew;
    const user = await this.userRepo.save(newUser);
    await this.listAPIRepo.save([
      { LISTAPI_NAME: '/api/guest/all', SCREEN: 'LIST_GUEST', TYPE: 'IS_READ' },
      {
        LISTAPI_NAME: '/api/guest/update',
        SCREEN: 'LIST_GUEST',
        TYPE: 'IS_UPDATE',
      },
      {
        LISTAPI_NAME: '/api/guest/change-status',
        SCREEN: 'LIST_GUEST',
        TYPE: 'IS_ACCEPT',
      },
      {
        LISTAPI_NAME: '/api/guest/delete',
        SCREEN: 'LIST_GUEST',
        TYPE: 'IS_DELETE',
      },
      {
        LISTAPI_NAME: '/api/guest/add',
        SCREEN: 'LIST_GUEST',
        TYPE: 'IS_CREATE',
      },
      { LISTAPI_NAME: '/api/user/all', SCREEN: 'USER', TYPE: 'IS_READ' },
      { LISTAPI_NAME: '/api/user/add', SCREEN: 'USER', TYPE: 'IS_CREATE' },
      { LISTAPI_NAME: '/api/user/edit', SCREEN: 'USER', TYPE: 'IS_UPDATE' },
      { LISTAPI_NAME: '/api/role/add', SCREEN: 'USER', TYPE: 'IS_CREATE' },
      { LISTAPI_NAME: '/api/role/update', SCREEN: 'USER', TYPE: 'IS_UPDATE' },
    ]);
    return 'ok';
  }
  async check() {
    const user = await this.userRepo.find({
      relations: ['role'],
    });
    const per = await this.permisRepo.find({});
    const role = await this.roleRepo.find({});
    return { user, per, role };
  }
}
