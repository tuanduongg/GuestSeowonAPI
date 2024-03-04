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
}
