/* eslint-disable @typescript-eslint/no-var-requires */
import { HttpStatus, Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { join } from 'path';
import { NotifiCationService } from 'src/notification/notificationservice';
import * as webpush from 'web-push';

// const serviceAccount = require('./keyFireBase.json');

@Injectable()
export class FirebaseService {
  private privateKey;
  private publicKey;
  constructor(private readonly notiService: NotifiCationService) {
    const vapidKeys = webpush.generateVAPIDKeys();
    this.privateKey = vapidKeys.privateKey;
    this.publicKey = vapidKeys.publicKey;
    console.log('Public key:', vapidKeys.publicKey);
    console.log('Private key:', vapidKeys.privateKey);
    const url = join(__dirname, '..', 'public') + '/keyFireBase.json';
    console.log('url', url);
    admin.initializeApp({
      credential: admin.credential.cert(url),
    });
  }

  // MESSAGING_SCOPE = 'https://www.googleapis.com/auth/firebase.messaging';
  // SCOPES = [MESSAGING_SCOPE];
  // getAccessToken() {
  //   return new Promise(function (resolve, reject) {
  //     const key = require('./keyFireBase.json');
  //     const jwtClient = new google.auth.JWT(
  //       key.client_email,
  //       null,
  //       key.private_key,
  //       SCOPES,
  //       null,
  //     );
  //   });
  // }

  async storeToken(request, body, res) {
    const token = body?.token;
    const data = await this.notiService.saveTokenFirebase(token, request?.user);
    if (data) {
      return res.status(HttpStatus.OK).send(data);
    }
    return res.status(HttpStatus.BAD_REQUEST).send({ message: 'insert fail' });
  }
  getVapidKey(request, body, res) {
    return res.status(HttpStatus.OK).send({ key: this.publicKey });
  }

  async sendNotification(data) {
    const { title, body } = data;
    // Khởi tạo Firebase Admin SDK từ thông tin xác thực
    // Tạo payload cho thông báo
    const payload = {
      notification: {
        title,
        body,
      },
    };
    const token = await this.notiService.getTokenFirebase();
    if (token?.length > 0) {
      try {
        const response = await admin.messaging().sendToDevice(token, payload);
        console.log('Successfully sent message:', response);
        return 'Notification sent successfully';
      } catch (error) {
        console.error('Error sending message:', error);
        throw new Error('Failed to send notification');
        return;
      }
    }
    throw new Error('Failed to send notification');
  }
}
