import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { Response } from 'express';
import { UnitService } from './unit.service';
@Controller('/unit')
export class UnitController {
  constructor(private readonly unitService: UnitService) {}
  @Get('/all')
  async getAll(@Res() res: Response) {
    const data = await this.unitService.getAll();
    return res.status(HttpStatus.OK).send(data);
  }
  @Get('/fake')
  async fake(@Res() res: Response) {
    const data = await this.unitService.fake();
    return res.status(HttpStatus.OK).send(data);
  }
}
