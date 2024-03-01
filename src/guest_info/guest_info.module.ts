import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GuestInfo } from 'src/entity/guest_info.entity';
import { GuestInfoController } from './guest_info.controller';
import { GuestInfoService } from './guest_info.service';

@Module({
  imports: [TypeOrmModule.forFeature([GuestInfo])],
  controllers: [GuestInfoController],
  providers: [GuestInfoService],
  exports: [GuestInfoService],
})
export class GuestInfoModule {}
