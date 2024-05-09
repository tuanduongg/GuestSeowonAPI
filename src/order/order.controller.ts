import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { OrderService } from './order.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('/order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}
  @UseGuards(AuthGuard)
  @Post('/all')
  async getAll(@Res() res: Response, @Req() request: Request, @Body() body) {
    const data = await this.orderService.getAll(body, request);
    return res.status(HttpStatus.OK).send(data);
  }

  @UseGuards(AuthGuard)
  @Post('/add')
  async addNewOrder(
    @Body() body,
    @Req() request: Request,
    @Res() res: Response,
  ) {
    const data = await this.orderService.addNew(body, request);
    if (data) {
      return res.status(HttpStatus.OK).send(data);
    }
    return res.status(HttpStatus.BAD_REQUEST).send({ message: 'Insert fail!' });
  }
  @UseGuards(AuthGuard)
  @Post('/change-status')
  async changeSatus(
    @Body() body,
    @Req() request: Request,
    @Res() res: Response,
  ) {
    const data = await this.orderService.changeStatus(body, request);
    if (data) {
      return res.status(HttpStatus.OK).send(data);
    }
    return res
      .status(HttpStatus.BAD_REQUEST)
      .send({ message: 'Change status fail!' });
  }
  @UseGuards(AuthGuard)
  @Post('/cancel')
  async cancel(
    @Body() body,
    @Req() request: Request,
    @Res() res: Response,
  ) {
    const data = await this.orderService.cancel(body, request);
    if (data) {
      return res.status(HttpStatus.OK).send(data);
    }
    return res
      .status(HttpStatus.BAD_REQUEST)
      .send({ message: 'Cancel order fail!' });
  }
  @UseGuards(AuthGuard)
  @Post('/detail')
  async detail(
    @Body() body,
    @Req() request: Request,
    @Res() res: Response,
  ) {
    const data = await this.orderService.detail(body, request,res);
    return data;
  }
  @UseGuards(AuthGuard)
  @Post('/detail-with-status')
  async detailWithStatus(
    @Body() body,
    @Req() request: Request,
    @Res() res: Response,
  ) {
    const data = await this.orderService.detailWithStatus(body, request,res);
    return data;
  }
}
