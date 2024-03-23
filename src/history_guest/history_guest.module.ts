import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistoryGuestService } from './history_guest.service';
import { HistoryGuest } from 'src/entity/history_guest.entity';
import { HistoryGuestController } from './history_guest.controller';

@Module({
  controllers: [HistoryGuestController],
  imports: [TypeOrmModule.forFeature([HistoryGuest])],
  providers: [HistoryGuestService],
  exports: [HistoryGuestService],
})
export class HistoryGuestModule {}
