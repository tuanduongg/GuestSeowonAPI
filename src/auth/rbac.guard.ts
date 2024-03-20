/* eslint-disable prettier/prettier */
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
// import { JwtService } from '@nestjs/jwt';
// import { jwtConstants } from './constants';
// import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { ListAPI } from 'src/entity/listapi.entity';
import { Repository } from 'typeorm';
// import { Response } from 'express';
import { Permisstion } from 'src/entity/permission.entity';

@Injectable()
export class RBACGuard implements CanActivate {
  constructor(
    @InjectRepository(ListAPI)
    private listAPIRepo: Repository<ListAPI>,
    @InjectRepository(Permisstion)
    private permissionRepo: Repository<Permisstion>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request?.user;
    const viewPage = request.headers?.viewpage;
    if (user && viewPage) {
      const permission = await this.permissionRepo.findOne({
        where: { ROLE: user?.role?.ROLE_ID, SCREEN: viewPage },
      });
      if (permission && permission?.IS_READ) {
        const apiName = request?.route?.path;
        const api = await this.listAPIRepo.findOne({
          where: { LISTAPI_NAME: apiName, SCREEN: viewPage },
        });
        if (api) {
          const type = api?.TYPE;
          if (permission[type]) {
            return true;
          }
        }
      }
      //403
      throw new ForbiddenException();
      return false;
    }
  }
}
