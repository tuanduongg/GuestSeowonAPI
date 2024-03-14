import { Module, forwardRef } from '@nestjs/common';
import { DiscordService } from './discord.service';
import { GuestModule } from 'src/guest/guest.module';

@Module({
  imports: [forwardRef(() => GuestModule)],
  providers: [DiscordService],
  exports: [DiscordService],
})
export class DiscordModule {}
