import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from 'src/entity/notification.entity';
import { NotificationController } from './notification.controller';
import { NotifiCationService } from './notificationservice';

@Module({
  imports: [TypeOrmModule.forFeature([Notification])],
  controllers: [NotificationController],
  providers: [NotifiCationService],
  exports: [NotifiCationService],
})
export class NotificationModule {}
