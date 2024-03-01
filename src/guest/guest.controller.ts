import { Controller, Get, Body, Req, Res, Post } from '@nestjs/common';
import { Request, Response } from 'express';
import { GuestService } from './guest.service';

@Controller('/guest')
export class GuestController {
  constructor(private readonly guestService: GuestService) {}

  @Post('/all')
  async getAll(@Body() body, @Req() request: Request, @Res() res: Response) {
    const data = await this.guestService.all(body, request, res);
    return data;
  }

  @Post('/add')
  async add(@Body() body, @Req() request: Request, @Res() res: Response) {
    const data = await this.guestService.add(body, request, res);
    return data;
  }
  @Post('/delete')
  async delete(@Body() body, @Req() request: Request, @Res() res: Response) {
    const data = await this.guestService.delete(body, request, res);
    return data;
  }

  @Post('/findById')
  async finByIDGuest(
    @Body() body,
    @Req() request: Request,
    @Res() res: Response,
  ) {
    const data = await this.guestService.findByID(body, request, res);
    return data;
  }

  @Get('/fake')
  async fake() {
    const data = await this.guestService.fake();
    return data;
  }

  // @Post('/add')
  // async add(@Body() body, @Req() request: Request, @Res() res: Response) {
  //   const data = await this.guestService.add(body, request);
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
  //     const data = await this.guestService.edit(body, request);
  //     if (data) {
  //       return res.status(HttpStatus.OK).send(data);
  //     }
  //   }
  //   return res.status(HttpStatus.BAD_REQUEST).send({ message: 'Update fail!' });
  // }
}
