import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GuestInfo } from 'src/entity/guest_info.entity';
import { GuestInfoController } from './guest_info.controller';
import { GuestInfoService } from './guest_info.service';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([GuestInfo]),UserModule],
  controllers: [GuestInfoController],
  providers: [GuestInfoService],
  exports: [GuestInfoService],
})
export class GuestInfoModule {}
