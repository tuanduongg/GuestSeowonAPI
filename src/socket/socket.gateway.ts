import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Injectable } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@Injectable()
@WebSocketGateway()
export class SocketGateway {
  @WebSocketServer() server: Server;

  sendNewGuestNotification(data: any) {
    this.server.emit('newguest', data);
  }
  onAcceptGuestNotification(data: any) {
    this.server.emit('acceptguest', data);
  }
}
