import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';
import { RoleService } from './role.service';

@Controller('/role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @UseGuards(AuthGuard)
  @Get('check')
  checkRole(@Req() request: Request, @Res() res: Response) {
    return this.roleService.checkRole(request, res);
  }

  @UseGuards(AuthGuard)
  @Get('all')
  allRole(@Req() request: Request, @Res() res: Response) {
    return this.roleService.allRole(res);
  }
  @Get('fake')
  fake() {
    return this.roleService.fake();
  }
}
