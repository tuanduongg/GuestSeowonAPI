import {
  Controller,
  Get,
  Body,
  Req,
  Res,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { GuestService } from './guest.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { RBACGuard } from 'src/auth/rbac.guard';

@Controller('/guest')
export class GuestController {
  constructor(private readonly guestService: GuestService) { }

  @UseGuards(RBACGuard)
  @UseGuards(AuthGuard)
  @Post('/all')
  async getAll(@Body() body, @Req() request: Request, @Res() res: Response) {
    if (body?.status === 'NEW') {
      const rs = await this.guestService.checkNewGuest(body, request, res);
      return rs;
    } else {
      const data = await this.guestService.all(body, request, res);
      return data;
    }
  }

  @UseGuards(RBACGuard)
  @UseGuards(AuthGuard)
  @Post('/add')
  async add(@Body() body, @Req() request: Request, @Res() res: Response) {
    const data = await this.guestService.add(body, request, res);
    return data;
  }

  @UseGuards(RBACGuard)
  @UseGuards(AuthGuard)
  @Post('/update')
  async update(@Body() body, @Req() request: Request, @Res() res: Response) {
    const data = await this.guestService.update(body, request, res);
    return data;
  }

  @UseGuards(RBACGuard)
  @UseGuards(AuthGuard)
  @Post('/delete')
  async delete(@Body() body, @Req() request: Request, @Res() res: Response) {
    const data = await this.guestService.delete(body, request, res);
    return data;
  }

  @UseGuards(AuthGuard)
  @Post('/findById')
  async finByIDGuest(
    @Body() body,
    @Req() request: Request,
    @Res() res: Response,
  ) {
    const data = await this.guestService.findByID(body, request, res);
    return data;
  }

  @UseGuards(RBACGuard)
  @UseGuards(AuthGuard)
  @Post('/change-status')
  async ChangeStatus(
    @Body() body,
    @Req() request: Request,
    @Res() res: Response,
  ) {
    const data = await this.guestService.changeStatus(body, request, res);
    return data;
  }

  // @UseGuards(RBACGuard)
  @UseGuards(AuthGuard)
  @Post('/cancel')
  async onCancel(@Body() body, @Req() request: Request, @Res() res: Response) {
    const data = await this.guestService.onCancel(body, request, res);
    return data;
  }

  // @UseGuards(AuthGuard)
  @Get('/export')
  async onExport(@Body() body, @Req() request: Request, @Res() res: Response) {
    // const data = await this.guestService.onExport(body);
    // Example data (you can replace this with your actual data)
    const data = [
      [1, '07/04/2024', 'John Doe A', '', 'Company A', 'Meeting', '10:00', '10:00', 'Alice', 'Sales'],
      [2, '08/04/2024', 'Jane Doe B', '', 'Company B', 'Consultation', '12:00', '12:00', 'Alice', 'Sales']
  ];
    const excelStream = await this.guestService.onExport(data);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=export.xlsx');

    excelStream.pipe(res);
    return data;
  }

  @Get('/fake')
  async fake() {
    const data = await this.guestService.fake();
    return data;
  }
}
