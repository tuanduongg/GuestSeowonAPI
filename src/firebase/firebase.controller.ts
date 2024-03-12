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
import { FirebaseService } from './firebase.service';

@Controller('/firebase')
export class FirebaseController {
  constructor(private readonly firebaseService: FirebaseService) {}

  @UseGuards(AuthGuard)
  @Get('getKey')
  getValidKey(@Body() body, @Req() request: Request, @Res() res: Response) {
    return this.firebaseService.getVapidKey(request, body, res);
  }
  @UseGuards(AuthGuard)
  @Post('store-token')
  storeToken(@Body() body, @Req() request: Request, @Res() res: Response) {
    return this.firebaseService.storeToken(request, body, res);
  }
}
