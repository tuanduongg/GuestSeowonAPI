// your.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { WebPushService } from './webpush.service';

@Controller('webpush')
export class WebPushController {
  constructor(private readonly pushService: WebPushService) {}

  @Post('send')
  async sendNotification(@Body() data: { subscription: any; payload: any }) {
    const { subscription, payload } = data;
    await this.pushService.sendNotification(subscription, payload);
    return { success: true };
  }
}
