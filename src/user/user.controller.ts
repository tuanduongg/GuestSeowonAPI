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
import { UserService } from './user.service';
import { Request, Response } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';
import { AdminGuard } from 'src/auth/admin.guard';

@Controller('/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getHello(): string {
    return this.userService.getHello();
  }

  // @Post('/all')
  // async getAll(@Body() body, @Req() request: Request, @Res() res: Response) {
  //   const data = await this.userService.all(body, request);
  //   if (data) {
  //     return res.status(HttpStatus.OK).send(data);
  //   }
  //   return res
  //     .status(HttpStatus.BAD_REQUEST)
  //     .send({ message: 'Get data fail!' });
  // }

  // @Post('/add')
  // async add(@Body() body, @Req() request: Request, @Res() res: Response) {
  //   const data = await this.userService.add(body, request);
  //   console.log('data', data);
  //   // if (data) {
  //   if (data == 'Username already exists') {
  //     return res.status(HttpStatus.BAD_REQUEST).send({ message: data });
  //   }
  //   return res.status(HttpStatus.OK).send(data);
  //   // }
  //   // return res.status(HttpStatus.BAD_REQUEST).send({ message: 'Insert fail!' });
  // }

  // @Post('/edit')
  // async edit(@Body() body, @Req() request: Request, @Res() res: Response) {
  //   if (body?.userID) {
  //     const data = await this.userService.edit(body, request);
  //     if (data) {
  //       return res.status(HttpStatus.OK).send(data);
  //     }
  //   }
  //   return res.status(HttpStatus.BAD_REQUEST).send({ message: 'Update fail!' });
  // }

  @Get('/info')
  getUser(@Req() request: Request) {
    return this.userService.getUser(request);
  }
}
