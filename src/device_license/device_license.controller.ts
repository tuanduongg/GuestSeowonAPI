import { Body, Controller, Get, HttpStatus, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { DeviceLicenseService } from './device_license.service';
import { DeviceLicense } from 'src/entity/device_license.entity';

@Controller('/device-license')
export class DeviceLicenseController {
  constructor(private readonly service: DeviceLicenseService) {}

  @Get('/add')
  async add(arr: Array<DeviceLicense>) {
    const data = await this.service.add(arr);
    return data;
  }
}
