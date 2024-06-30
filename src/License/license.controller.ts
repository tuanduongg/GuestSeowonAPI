import { Controller, Get, HttpStatus,  Res } from '@nestjs/common';
import { Response } from 'express';
import { LicenseService } from './license.service';

@Controller('/license')
export class LicenseController {
  constructor(private readonly service: LicenseService) {}

  @Get('/all')
  async getAll(@Res() res: Response) {
    const data = await this.service.getAll();
    return res.status(HttpStatus.OK).send(data);
  }
}
