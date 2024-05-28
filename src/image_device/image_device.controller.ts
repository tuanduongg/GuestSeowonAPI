import { Body, Controller, Get, HttpStatus, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { ImageDeviceService } from './image_device.service';

@Controller('/image-device')
export class ImageDeviceController {
  constructor(private readonly imageDeviceService: ImageDeviceService) { }
  @Post('/delete')
  async deleteByID(@Body() body, @Res() res: Response) {
      const data = await this.imageDeviceService.delete(body, res);
      return data;
  }
}
