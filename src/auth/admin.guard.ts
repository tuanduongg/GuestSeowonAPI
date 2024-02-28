/* eslint-disable prettier/prettier */
import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';;
import { Request } from 'express';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor() {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    console.log('user', request['user']);
    if (request?.user?.isApprover) {
      return true;
    }
    return false;
  }
}
