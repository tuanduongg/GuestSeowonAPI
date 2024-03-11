import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { NotifiCationService } from './notificationservice';
import { Request, Response } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('/notification')
export class NotificationController {
  constructor(private readonly notiService: NotifiCationService) {}

  @UseGuards(AuthGuard)
  @Post('subscription')
  subscription(@Body() body, @Req() request: Request, @Res() res: Response) {
    return this.notiService.subscription(request, body, res);
  }
  @UseGuards(AuthGuard)
  @Post('pushsubscriptionchange')
  pushsubscriptionchange(
    @Body() body,
    @Req() request: Request,
    @Res() res: Response,
  ) {
    return this.notiService.pushsubscriptionchange(request, body, res);
  }
}
