import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistoryGuestService } from './history_guest.service';
import { HistoryGuest } from 'src/entity/history_guest.entity';
import { HistoryGuestController } from './history_guest.controller';
import { UserModule } from 'src/user/user.module';
import { Permisstion } from 'src/entity/permission.entity';
import { ListAPI } from 'src/entity/listapi.entity';

@Module({
  controllers: [HistoryGuestController],
  imports: [TypeOrmModule.forFeature([HistoryGuest,ListAPI,Permisstion]),UserModule],
  providers: [HistoryGuestService],
  exports: [HistoryGuestService],
})
export class HistoryGuestModule {}
