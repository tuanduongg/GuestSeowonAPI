import { Inject, Injectable, forwardRef } from '@nestjs/common';
import * as Discord from 'discord.js';
import { Guest } from 'src/entity/guest.entity';
import { GuestService } from 'src/guest/guest.service';
import { templateInBox } from 'src/helper';

@Injectable()
export class DiscordService {
  private readonly client: Discord.Client;
  private readonly REGEX = /[\w]{8}-[\w]{4}-[\w]{4}-[\w]{4}-[\w]{12}/i;

  private channelID: string;
  private currentChannel;
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
  private async clearChat(msg, numb) {
    msg.channel.clone().then(() => msg.channel.delete().catch(() => null), numb);

  }

  // async findMessage(channel_id, messageID) {}
  private initialize() {
    this.client.on('ready', async () => {
      console.log(`Bot ${this.client.user.tag} successfully logged in!`);
      this.currentChannel = await this.client.channels.fetch(
        process.env.ID_CHANNEL_DISCORD,
      );
    });
    this.client.on('messageCreate', async (message) => {
      this.channelID = message.channelId;
      if (message.content === ("/clone-channel")) {
        this.clearChat(message, 100);
      }
      if (message?.content?.trim() === '/cancel') {
        const reference = message?.reference;
        if (reference) {
          //nếu reply thì mới được
          const channel = this.client.channels.cache.get(
            reference?.channelId,
          ) as Discord.TextChannel;
          if (channel) {
            const messageFind = await channel.messages.fetch(
              reference?.messageId,
            );
            const found = messageFind?.content?.match(this.REGEX);
            if (found && found[0]) {
              const updated = await this.guestService.cancelFromDiscord(
                found[0],
                message?.author?.username,
              );
              if (updated) {
                messageFind.react('❌');
              }
            }
          }
        }
      }
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

  async sendMessage(message: string, icon: string = '') {
    const channel_id = this.channelID
      ? this.channelID
      : process.env.ID_CHANNEL_DISCORD;
    const channel = this.client.channels.cache.get(
      channel_id,
    ) as Discord.TextChannel;
    if (channel) {
      const sentMessage = await channel.send(message);
      if (icon && icon !== '') {
        await sentMessage.react(icon);
      }
    } else {
      console.error('Channel not found');
    }
  }
  async onEditMessage(guest: Guest) {
    const channel_id = this.channelID
      ? this.channelID
      : process.env.ID_CHANNEL_DISCORD;
    const channel = this.client.channels.cache.get(
      channel_id,
    ) as Discord.TextChannel;
    if (channel) {
      const messageArr = await channel.messages.fetch({ limit: 100 });
      const find = messageArr.find((messageItem) => {
        const found = messageItem?.content?.match(this.REGEX);
        if (found && found[0]) {
          return found[0].trim() === guest?.GUEST_ID;
        }
        return false;
      });
      if (find) {
        await find.edit(templateInBox(guest));
      }
      return find;
    } else {
      console.error('Channel not found onEditMessage');
    }
  }
  async onEditMessageIMG(id, buffer) {
    const channel_id = this.channelID
      ? this.channelID
      : process.env.ID_CHANNEL_DISCORD;
    const channel = this.client.channels.cache.get(
      channel_id,
    ) as Discord.TextChannel;
    if (channel) {
      const messageArr = await channel.messages.fetch({ limit: 100 });
      const find = messageArr.find((messageItem) => {
        const found = messageItem?.content?.match(this.REGEX);
        if (found && found[0]) {
          return found[0].trim() === id;
        }
        return false;
      });
      if (find) {
        await find.edit({
          content: `#:${id}`,
          files: [buffer]
        });
      }
      return find;
    } else {
      console.error('Channel not found onEditMessage');
    }
  }

  async addReactMessage(idGuest = [], react: string) {
    // id guest -> tìm message chứa id đó -> add react
    const channel_id = this.channelID
      ? this.channelID
      : process.env.ID_CHANNEL_DISCORD;
    const channel = this.client.channels.cache.get(
      channel_id,
    ) as Discord.TextChannel;
    if (channel) {
      const messageArr = await channel.messages.fetch({ limit: 100 });
      const arrFinds = messageArr.filter((mes) => {
        const found = mes?.content?.match(this.REGEX);
        if (found && found[0]) {
          return idGuest.includes(found[0].trim());
        }
        return false;
      });
      if (arrFinds) {
        const arrPromise = [];
        arrFinds.map((item) => {
          arrPromise.push(item.react(react));
        });
        await Promise.all(arrPromise);
      }
    }
  }


  async sendImage(buffer, id, icon: string = '') {
    const channel_id = this.channelID
      ? this.channelID
      : process.env.ID_CHANNEL_DISCORD;
    const channel = this.client.channels.cache.get(
      channel_id,
    ) as Discord.TextChannel;
    if (channel) {
      try {
        const messageSend = await channel.send({
          content: `#:${id}`,
          files: [buffer]
        });
        if (icon !== '') {
          await messageSend.react(icon);
        }
      } catch (error) {
        console.log(error);

      }
    } else {
      console.error('Channel not found');
    }
  }
}
