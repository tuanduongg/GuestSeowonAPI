import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification } from 'src/entity/notification.entity';
import { Repository, Not, Like } from 'typeorm';
import * as webpush from 'web-push';

@Injectable()
export class NotifiCationService {
  constructor(
    @InjectRepository(Notification)
    private notiRepo: Repository<Notification>,
  ) {
    // const vapidKeys = webpush.generateVAPIDKeys();
    // console.log('vapidKeys', vapidKeys);
    webpush.setVapidDetails(
      'mailto:toiladuongtuan@gmail.com',
      process.env.PUBLIC_KEY,
      process.env.PRIVATE_KEY,
    );
  }
  async subscription(request, body, res) {
    if (body?.data) {
      const dataOBJ = JSON.parse(body?.data);
      const notification = new Notification();
      notification.AUTH = dataOBJ?.keys?.auth ?? '';
      notification.ENDPOINT = dataOBJ?.endpoint ?? '';
      notification.EXPIRATION_TIME = dataOBJ?.expirationTime ?? '';
      notification.P256DH = dataOBJ?.keys?.p256dh ?? '';
      notification.USERNAME = request?.user?.username;
      const saved = await this.notiRepo.save(notification);
      return res.status(HttpStatus.OK).send(saved);
    }
    return res.status(HttpStatus.BAD_REQUEST).send({ message: 'cannot add' });
  }
  async pushsubscriptionchange(request, body, res) {
    console.log('body', body);
    // if (body?.data) {
    // {
    //   old_endpoint: event.oldSubscription ? event.oldSubscription.endpoint : null,
    //   new_endpoint: event.newSubscription ? event.newSubscription.endpoint : null,
    //   new_p256dh: event.newSubscription ? event.newSubscription.toJSON().keys.p256dh : null,
    //   new_auth: event.newSubscription ? event.newSubscription.toJSON().keys.auth : null
    // }
    return res.status(HttpStatus.OK).send(body);
    // }
    return res.status(HttpStatus.BAD_REQUEST).send({ message: 'cannot add' });
  }

  async findOne() {
    const noti = await this.notiRepo.findOne({});
    if (noti) {
      return {
        endpoint: noti.ENDPOINT,
        expirationTime: null,
        keys: {
          p256dh: noti.P256DH,
          auth: noti.AUTH,
        },
      };
    }
    return null;
  }
  async sendPushNotification(message: string) {
    const payload = JSON.stringify({
      title: 'New Notification Custom',
      message,
    });
    const noti = await this.notiRepo.findOne({ where: { USERNAME: 'admin' } });
    if (noti) {
      const sub = {
        endpoint: noti.ENDPOINT,
        expirationTime: null,
        keys: {
          p256dh: noti.P256DH,
          auth: noti.AUTH,
        },
      };
      console.log('sub', sub);
      webpush
        .sendNotification(sub, payload)
        .then((result) => {
          console.log('sendNotification result', result);
        })
        .catch((err) => {
          console.log('sendNotification err', err);
        });
    }
    return null;
  }
}
