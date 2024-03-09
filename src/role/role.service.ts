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
