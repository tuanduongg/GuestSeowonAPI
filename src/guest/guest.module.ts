import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Guest } from 'src/entity/guest.entity';
import { GuestController } from './guest.controller';
import { GuestService } from './guest.service';
import { GuestDate } from 'src/entity/guest_date.entity';
import { GuestInfo } from 'src/entity/guest_info.entity';
import { ListAPI } from 'src/entity/listapi.entity';
import { Permisstion } from 'src/entity/permission.entity';
import { SocketModule } from 'src/socket/socket.module';

@Module({
  imports: [
    SocketModule,
    TypeOrmModule.forFeature([
      Guest,
      GuestDate,
      GuestInfo,
      ListAPI,
      Permisstion,
    ]),
  ],
  controllers: [GuestController],
  providers: [GuestService],
  exports: [GuestService],
})
export class GuestModule {}
