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
import { MigrateService } from './migrate.service';
import { Request, Response } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';
import { AdminGuard } from 'src/auth/admin.guard';

@Controller('/migrate')
export class MigrateController {
  constructor(private readonly migrateService: MigrateService) {}

  @Get()
  getHello(): string {
    return this.migrateService.getHello();
  }
  @Get('/fake')
  fake() {
    return this.migrateService.fake();
  }
  @Get('/check')
  check() {
    return this.migrateService.check();
  }
}
