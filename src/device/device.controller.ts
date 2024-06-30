import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Req,
  Res,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';
import { RBACGuard } from 'src/auth/rbac.guard';
import { DeviceService } from './device.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { multerConfig } from 'src/config/multer.config';
import { Device } from 'src/entity/device.entity';

@Controller('/device')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) { }

  // @UseGuards(RBACGuard)
  @Post('/all')
  async all(@Res() res: Response, @Req() request: Request, @Body() body) {
    return await this.deviceService.all(body, request, res);
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(FilesInterceptor('files', 10, multerConfig))
  @Post('/add')
  async add(
    @Res() res: Response,
    @Req() request: Request,
    @Body() body,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ): Promise<Device> {
    return await this.deviceService.add(body, request, res, files);
  }
  @UseGuards(AuthGuard)
  @Post('/add-multiple')
  async addMultiple(
    @Res() res: Response,
    @Req() request: Request,
    @Body() body,
  ) {
    return await this.deviceService.addMultiple(body, request, res);
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(FilesInterceptor('files', 10, multerConfig))
  @Post('/edit')
  async edit(
    @Res() res: Response,
    @Req() request: Request,
    @Body() body,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ): Promise<Device> {
    return await this.deviceService.edit(body, request, res, files);
  }

  @UseGuards(AuthGuard)
  @Post('/detail')
  async detail(
    @Res() res: Response,
    @Req() request: Request,
    @Body() body,
  ): Promise<Device> {
    return await this.deviceService.detail(body, request, res);
  }

  @UseGuards(AuthGuard)
  @Post('/change-status')
  async changeStatus(
    @Res() res: Response,
    @Req() request: Request,
    @Body() body,
  ): Promise<Device> {
    return await this.deviceService.changeStatus(body, request, res);
  }

  @UseGuards(AuthGuard)
  @Post('/delete')
  async delete(
    @Res() res: Response,
    @Req() request: Request,
    @Body() body,
  ) {
    return await this.deviceService.delete(body, request, res);
  }

  @UseGuards(AuthGuard)
  @Get('/statistic')
  async statistic(
    @Res() res: Response
  ) {
    return await this.deviceService.statistic(res);
  }

  @UseGuards(AuthGuard)
  @Post('/upload-excel')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Res() res: Response, @Req() request: Request) {

    return await this.deviceService.readExcelFile(file, res, request);
  }
  // @UseGuards(AuthGuard)
  @Post('/export-excel')
  @UseInterceptors(FileInterceptor('file'))
  async exportExcel(@Res() res: Response,
    @Req() request: Request,
    @Body() body,) {

    return await this.deviceService.exportExcel(body, res, request);
  }
}
