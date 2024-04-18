import { Body, Controller, Get, HttpStatus, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { ImageService } from './image.service';

@Controller('/image')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Get('/fake')
  async fakeData(@Res() res: Response) {
    const data = await this.imageService.fake();
    return res.status(HttpStatus.OK).send(data);
  }
  @Get('/all')
  async getAll(@Res() res: Response) {
    const data = await this.imageService.getAll();
    return res.status(HttpStatus.OK).send(data);
  }
  @Post('/delete')
  async deleteByID(@Body() body, @Res() res: Response) {
    const id = body?.imageID;
    if (id) {
      const data = await this.imageService.deleteByID(id);
      if (data) {
        return res.status(HttpStatus.OK).send(data);
      }
    }
    return res
      .status(HttpStatus.BAD_REQUEST)
      .send({ message: 'Cannot delete image' });
  }
  @Get('/generate')
  async generate(@Res() res: Response) {
      const data = await this.imageService.generate(res);
      return data;
  }
}
