import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Guest } from 'src/entity/guest.entity';
import { GuestController } from './guest.controller';
import { GuestService } from './guest.service';
import { GuestDate } from 'src/entity/guest_date.entity';
import { GuestInfo } from 'src/entity/guest_info.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Guest, GuestDate, GuestInfo])],
  controllers: [GuestController],
  providers: [GuestService],
  exports: [GuestService],
})
export class GuestModule {}
