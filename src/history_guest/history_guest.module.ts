import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistoryGuestService } from './history_guest.service';
import { HistoryGuest } from 'src/entity/history_guest.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HistoryGuest])],
  providers: [HistoryGuestService],
  exports: [HistoryGuestService],
})
export class HistoryGuestModule {}
