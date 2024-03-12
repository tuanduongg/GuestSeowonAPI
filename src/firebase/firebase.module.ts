import { Injectable, Module } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { FirebaseController } from './firebase.controller';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [NotificationModule],
  controllers: [FirebaseController],
  providers: [FirebaseService],
  exports: [FirebaseService],
})
export class FirebaseModule {}
