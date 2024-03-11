import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService {
  constructor() {}

  async sendNotification(data) {
    const { title, body } = data;
    // Khởi tạo Firebase Admin SDK từ thông tin xác thực
    admin.initializeApp({
      credential: admin.credential.cert('./keyFireBase.json'),
    });
    // Tạo payload cho thông báo
    const payload = {
      notification: {
        title,
        body,
      },
    };

    try {
      const response = await admin
        .messaging()
        .sendToTopic('allDevices', payload);
      console.log('Successfully sent message:', response);
      return 'Notification sent successfully';
    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error('Failed to send notification');
    }
  }
}
