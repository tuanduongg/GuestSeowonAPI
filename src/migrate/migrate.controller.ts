import {
  Controller,
  Get,
} from '@nestjs/common';
import { MigrateService } from './migrate.service';

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
