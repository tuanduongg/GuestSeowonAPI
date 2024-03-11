import { Body, Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { Request, Response } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';
import { RBACGuard } from 'src/auth/rbac.guard';

@Controller('/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getHello(): string {
    return this.userService.getHello();
  }

  @UseGuards(RBACGuard)
  @UseGuards(AuthGuard)
  @Get('/all')
  async getAll(@Body() body, @Req() request: Request, @Res() res: Response) {
    const data = await this.userService.all(body, request, res);
    return data;
  }

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

  @UseGuards(AuthGuard)
  @Get('/info')
  getUser(@Req() request: Request) {
    return this.userService.getUser(request);
  }
  @Get('/fake')
  fake(@Req() request: Request) {
    return this.userService.fake();
  }
}
