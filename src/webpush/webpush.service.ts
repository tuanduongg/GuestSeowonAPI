// push.service.ts
import { Injectable } from '@nestjs/common';
import * as webPush from 'web-push';

@Injectable()
export class WebPushService {
  private readonly publicKey = process.env.PUBLIC_KEY;
  private readonly privateKey = process.env.PRIVATE_KEY;

  constructor() {
    webPush.setVapidDetails(process.env.EMAIL, this.publicKey, this.privateKey);
  }

  async sendNotification(subscription: any, payload: any) {
    try {
      await webPush.sendNotification(subscription, JSON.stringify(payload));
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }
}
