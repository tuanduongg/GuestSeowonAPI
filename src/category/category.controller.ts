import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { CategoryService } from './category.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('/category')
export class CategoryController {
  constructor(private readonly cateService: CategoryService) {}

  @Get('/fake')
  async fakeData(@Res() res: Response) {
    const data = await this.cateService.fake();
    return res.status(HttpStatus.OK).send(data);
  }

  @UseGuards(AuthGuard)
  @Get('/all')
  async getAll(@Res() res: Response) {
    const data = await this.cateService.getAll();
    return res.status(HttpStatus.OK).send(data);
  }
  @UseGuards(AuthGuard)
  @Post('/add')
  async add(@Res() res: Response, @Req() request: Request, @Body() body) {
    const data = await this.cateService.add(body);
    if (data) {
      return res.status(HttpStatus.OK).send(data);
    }
    return res
      .status(HttpStatus.BAD_REQUEST)
      .send({ message: 'Cannot add category' });
  }
  @UseGuards(AuthGuard)
  @Post('/update')
  async update(@Res() res: Response, @Req() request: Request, @Body() body) {
    return await this.cateService.update(body, res);
  }
}
