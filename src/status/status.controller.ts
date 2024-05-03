import { Body, Controller, Get, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { StatusService } from './status.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('/status')
export class StatusController {
  constructor(private readonly statusService: StatusService) { }

  @UseGuards(AuthGuard)
  @Get('/all')
  async getAll(@Res() res: Response) {
    const data = await this.statusService.getAll();
    return res.status(HttpStatus.OK).send(data);
  }
  @Get('/allMax')
  async getAllWithMax(@Res() res: Response) {
    const data = await this.statusService.findByLevelWithMax(2);
    return res.status(HttpStatus.OK).send(data);
  }
  
  @UseGuards(AuthGuard)
  @Post('/findByDepartment')
  async findByDepartment(@Body() body,
    @Req() request: Request,
    @Res() res: Response,) {
    const data = await this.statusService.findByDepartment(body
      , request
      , res);
    return (data);
  }
}
