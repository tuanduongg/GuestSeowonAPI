import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Permisstion } from 'src/entity/permission.entity';
import { Role } from 'src/entity/role.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private roleRepo: Repository<Role>,
    @InjectRepository(Permisstion)
    private permisRepo: Repository<Permisstion>,
  ) {}

  async checkRole(request, res) {
    const user = request?.user;
    const viewPage = request.headers?.viewpage;
    if (user && viewPage) {
      const { role } = user;
      const permiss = await this.permisRepo.findOne({
        where: { ROLE: role?.ROLE_ID, SCREEN: viewPage },
      });
      if (permiss) {
        return res.status(HttpStatus.OK).send(permiss);
      }
    }
    return res.status(HttpStatus.BAD_REQUEST).send({ message: 'NOT FOUND!' });
  }
  async allRole(res) {
    const roles = await this.roleRepo.find({
      select: {
        ROLE_ID: true,
        ROLE_NAME: true,
      },
      relations: ['permisstions'],
    });
    return res.status(HttpStatus.OK).send(roles);
  }
  async addRole(body, request, res) {
    const role = new Role();
    role.ROLE_NAME = body?.ROLE_NAME;
    const saved = await this.roleRepo.save(role);
    if (saved) {
      const data = body?.data;
      if (data) {
        const dataUpdate = [];
        data.map((item) => {
          const permisstion = new Permisstion();
          permisstion.ROLE = role.ROLE_ID;
          permisstion.SCREEN = item?.screen;
          permisstion.IS_CREATE = item?.isCreate;
          permisstion.IS_READ = item?.isRead;
          permisstion.IS_UPDATE = item?.isUpdate;
          permisstion.IS_DELETE = item?.isDelete;
          permisstion.IS_ACCEPT = item?.isAccept;
          dataUpdate.push(permisstion);
        });
        const permisstionSaved = await this.permisRepo.save(dataUpdate);
        return res.status(HttpStatus.OK).send(permisstionSaved);
      }
    }
    return res.status(HttpStatus.BAD_REQUEST).send({ message: 'Insert fail!' });
  }
  async updateRole(body, request, res) {
    const data = body?.data;
    const arrPer = [];
    const arrRole = [];
    data.map((item) => {
      if (item?.permisstions) {
        arrPer.push(...item?.permisstions);
      }
      // delete item.permisstions;
      // arrRole.push(item);
    });
    const permisstionPromiss = await this.permisRepo.save(arrPer);
    // const rolePromiss = this.permisRepo.save(arrRole);
    // const result = await Promise.all([permisstionPromiss, rolePromiss]);
    if (permisstionPromiss) {
      return res.status(HttpStatus.OK).send(permisstionPromiss);
    }
    return res.status(HttpStatus.BAD_REQUEST).send({ message: 'Update fail!' });
  }
  async fake() {
    return this.permisRepo.save({
      ROLE: 'A747433E-F36B-1410-80D8-00368CCD0EB0',
      SCREEN: 'LIST_GUEST',
      IS_READ: true,
      IS_ACCEPT: true,
      IS_CREATE: true,
      IS_UPDATE: true,
      IS_DELETE: true,
    });
    // return await this.roleRepo.find({});
  }
}
