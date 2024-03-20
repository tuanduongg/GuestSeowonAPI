import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
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

  @UseGuards(AuthGuard)
  @Post('/add')
  async add(@Body() body, @Req() request: Request, @Res() res: Response) {
    const data = await this.userService.add(body, request, res);
    return data;
  }

  @UseGuards(AuthGuard)
  @Post('/edit')
  async edit(@Body() body, @Req() request: Request, @Res() res: Response) {
    return await this.userService.edit(body, request, res);
  }
  
  @UseGuards(AuthGuard)
  @Post('/change-block')
  async changeBlock(
    @Body() body,
    @Req() request: Request,
    @Res() res: Response,
  ) {
    return await this.userService.changeBlock(body, request, res);
  }

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
