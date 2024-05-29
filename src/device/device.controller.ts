import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Req,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';
import { RBACGuard } from 'src/auth/rbac.guard';
import { DeviceService } from './device.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { multerConfig } from 'src/config/multer.config';
import { Device } from 'src/entity/device.entity';

@Controller('/device')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) { }

  // @UseGuards(RBACGuard)
  // @UseGuards(AuthGuard)
  @Post('/all')
  async all(@Res() res: Response, @Req() request: Request, @Body() body) {
    return await this.deviceService.all(body, request, res);
  }

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

  @Post('/detail')
  async detail(
    @Res() res: Response,
    @Req() request: Request,
    @Body() body,
  ): Promise<Device> {
    return await this.deviceService.detail(body, request, res);
  }

  @Post('/change-status')
  async changeStatus(
    @Res() res: Response,
    @Req() request: Request,
    @Body() body,
  ): Promise<Device> {
    return await this.deviceService.changeStatus(body, request, res);
  }
  @Post('/delete')
  async delete(
    @Res() res: Response,
    @Req() request: Request,
    @Body() body,
  ) {
    return await this.deviceService.delete(body, request, res);
  }

  @Get('/statistic')
  async statistic(
    @Res() res: Response
  ) {
    return await this.deviceService.statistic(res);
  }
}
