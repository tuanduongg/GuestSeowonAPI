import { Controller, Get, HttpStatus, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { StatusService } from './status.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('/status')
export class StatusController {
  constructor(private readonly cateService: StatusService) {}

  @UseGuards(AuthGuard)
  @Get('/all')
  async getAll(@Res() res: Response) {
    const data = await this.cateService.getAll();
    return res.status(HttpStatus.OK).send(data);
  }
  @Get('/allMax')
  async getAllWithMax(@Res() res: Response) {
    const data = await this.cateService.findByLevelWithMax(2);
    return res.status(HttpStatus.OK).send(data);
  }
}
