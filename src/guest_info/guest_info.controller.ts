import { Controller, Get, Body, Req, Res, Post } from '@nestjs/common';
import { Request, Response } from 'express';
import { GuestInfoService } from './guest_info.service';

@Controller('/guest-info')
export class GuestInfoController {
  constructor(private readonly guestInfoService: GuestInfoService) {}

  @Post('/update')
  async getAll(@Body() body, @Req() request: Request, @Res() res: Response) {
    const data = await this.guestInfoService.update(body, request, res);
    return data;
  }
  @Post('/delete')
  async delete(@Body() body, @Req() request: Request, @Res() res: Response) {
    const data = await this.guestInfoService.delete(body, request, res);
    return data;
  }
}
