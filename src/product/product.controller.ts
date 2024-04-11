import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Req,
  Res,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { Response, Request } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { multerConfig } from 'src/config/multer.config';

@Controller('/product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // @UseGuards(AdminGuard)
  @UseGuards(AuthGuard)
  @Post('/public')
  async getAllIsShow(
    @Body() body,
    @Req() request: Request,
    @Res() res: Response,
  ) {
    body.isShow = true;
    const data = await this.productService.getAllIsShow(body, true);
    return res.status(HttpStatus.OK).send(data);
  }

  @UseGuards(AuthGuard)
  @Post('/all')
  async getAll(@Body() body, @Req() request: Request, @Res() res: Response) {
    const data = await this.productService.getAllIsShow(body);
    return res.status(HttpStatus.OK).send(data);
  }

  @UseGuards(AuthGuard)
  @Post('/delete')
  async delete(@Body() body, @Req() request: Request, @Res() res: Response) {
    const data = await this.productService.deleteProduct(body, request);
    return res.status(HttpStatus.OK).send(data);
  }

  @UseGuards(AuthGuard)
  @Post('/changePublic')
  async changePublic(
    @Body() body,
    @Req() request: Request,
    @Res() res: Response,
  ) {
    const data = await this.productService.changePublic(body);
    if (data) {
      return res.status(HttpStatus.OK).send(data);
    }
    return res
      .status(HttpStatus.BAD_REQUEST)
      .send({ message: 'Cannot found product!' });
  }

  @UseGuards(AuthGuard)
  @Post('/add')
  @UseInterceptors(FilesInterceptor('files', 10, multerConfig))
  async addProduct(
    @Body() body,
    @Req() request: Request,
    @Res() res: Response,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    if (body?.data) {
      const product = JSON.parse(body?.data);
      const data = await this.productService.addProduct(
        product,
        request,
        files,
      );
      if (data) {
        return res.status(HttpStatus.OK).send(data);
      }
    }
    return res
      .status(HttpStatus.BAD_REQUEST)
      .send({ message: 'Cannot add product!' });
  }

  @UseGuards(AuthGuard)
  @Post('/edit')
  @UseInterceptors(FilesInterceptor('files', 10, multerConfig))
  async editProduct(
    @Body() body,
    @Req() request: Request,
    @Res() res: Response,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    if (body?.data) {
      const product = JSON.parse(body?.data);
      const data = await this.productService.editProduct(
        product,
        request,
        files,
      );
      if (data) {
        return res.status(HttpStatus.OK).send(data);
      }
    }
    return res
      .status(HttpStatus.BAD_REQUEST)
      .send({ message: 'Cannot edit product!' });
  }
  @UseGuards(AuthGuard)
  @Post('/uploadExcel')
  @UseInterceptors(FileInterceptor('file'))
  async uploadExcel(
    @Body() body,
    @Req() request: Request,
    @Res() res: Response,
    @UploadedFile() file: Express.Multer.File,
  ) {
    console.log('file', file);
    const data = await this.productService.uploadExcel(
      body,
      file,
      request,
      res,
    );
    return data;
    console.log('data', data);
  }
}
