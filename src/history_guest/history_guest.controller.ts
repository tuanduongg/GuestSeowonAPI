import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';
import { HistoryGuestService } from './history_guest.service';

@Controller('/history-guest')
export class HistoryGuestController {
  constructor(private readonly historyGuestService: HistoryGuestService) {}

  @UseGuards(AuthGuard)
  @Post('/findByGuest')
  async findByGuest(
    @Body() body,
    @Req() request: Request,
    @Res() res: Response,
  ) {
    const data = await this.historyGuestService.findByGuest(body, request, res);
    return data;
  }
}
