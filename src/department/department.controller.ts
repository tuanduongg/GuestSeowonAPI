import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { DepartmentService } from './deparment.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { RBACGuard } from 'src/auth/rbac.guard';

@Controller('/department')
export class DepartmentController {
  constructor(private readonly service: DepartmentService) {}


  @UseGuards(RBACGuard)
  @UseGuards(AuthGuard)
  @Get('/all')
  async getAll(@Res() res: Response) {
    const data = await this.service.getAll();
    return res.status(HttpStatus.OK).send(data);
  }


  @UseGuards(RBACGuard)
  @UseGuards(AuthGuard)
  @Post('/add')
  async add(@Res() res: Response, @Req() request: Request, @Body() body) {
    const data = await this.service.add(body);
    if (data) {
      return res.status(HttpStatus.OK).send(data);
    }
    return res
      .status(HttpStatus.BAD_REQUEST)
      .send({ message: 'Cannot add department' });
  }

  
  @UseGuards(RBACGuard)
  @UseGuards(AuthGuard)
  @Post('/update')
  async update(@Res() res: Response, @Req() request: Request, @Body() body) {
    return await this.service.update(body, res);
  }
}
