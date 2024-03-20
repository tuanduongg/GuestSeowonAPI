import { Inject, Injectable, forwardRef } from '@nestjs/common';
import * as Discord from 'discord.js';
import { GuestService } from 'src/guest/guest.service';

@Injectable()
export class DiscordService {
  private readonly client: Discord.Client;
  private readonly REGEX = /[\w]{8}-[\w]{4}-[\w]{4}-[\w]{4}-[\w]{12}/i;

  private channelID: string;
  constructor(
    @Inject(forwardRef(() => GuestService))
    private guestService: GuestService,
  ) {
    this.client = new Discord.Client({
      intents: [
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.MessageContent,
        Discord.GatewayIntentBits.GuildMessages,
        Discord.GatewayIntentBits.GuildMessageReactions,
      ],
      partials: [
        Discord.Partials.Channel,
        Discord.Partials.Message,
        Discord.Partials.Reaction,
      ],
    });
    this.initialize();
  }
  private initialize() {
    this.client.on('ready', () => {
      console.log(`Bot ${this.client.user.tag} successfully logged in!`);
    });
    this.client.on('messageCreate', async (message) => {
      this.channelID = message.channelId;
    });
    this.client.on('messageReactionAdd', async (reaction, user) => {
      // Kiểm tra xem phản ứng có phải từ bot hay không
      if (user?.bot) return;
      // Lấy thông tin về tin nhắn gốc
      const currentMsg = reaction.message;
      let contentMessage = currentMsg?.content;
      if (!contentMessage) {
        const channelFound = this.client.channels.cache.get(
          currentMsg.channelId,
        ) as Discord.TextChannel;
        const message = await channelFound.messages.fetch(currentMsg.id);
        contentMessage = message.content;
      }
      const found = contentMessage?.match(this.REGEX);

      if (found && found[0]) {
        //nếu đúng là message có mã uuid
        //change status
        await this.guestService.changeStatusFromDiscord(
          found[0].trim(),
          user?.username,
        );
      }
    });

    this.client.login(process.env.BOT_DISCORD);
  }
  async sendMessage(message: string) {
    const channel_id = this.channelID
      ? this.channelID
      : process.env.ID_CHANNEL_DISCORD;
    const channel = this.client.channels.cache.get(
      channel_id,
    ) as Discord.TextChannel;
    if (channel) {
      await channel.send(message);
    } else {
      console.error('Channel not found');
    }
  }
  async addReactMessage(idGuest: string) {
    // id guest -> tìm message chứa id đó -> add react
    const channel_id = this.channelID
      ? this.channelID
      : process.env.ID_CHANNEL_DISCORD;
    const channel = this.client.channels.cache.get(
      channel_id,
    ) as Discord.TextChannel;
    if (channel) {
      const messageArr = await channel.messages.fetch({ limit: 100 });
      const messFind = messageArr.find((mes) => {
        const found = mes?.content?.match(this.REGEX);
        if (found && found[0]) {
          return found[0].trim() === idGuest;
        }
      });
      if (messFind) {
        await messFind.react('👍');
      }
    }
  }
}
