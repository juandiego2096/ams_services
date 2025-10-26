import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from '../api/auth/auth.service';
import { Injectable } from '@nestjs/common';

const clients: { userId: string; userRole: string }[] = [];

@WebSocketGateway({
  cors: { origin: '*' },
})
@Injectable()
export class SocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  constructor(private readonly authService: AuthService) {}

  afterInit() {
    console.log('Socket port initialised');
  }

  handleConnection() {}

  handleDisconnect() {}

  @SubscribeMessage('event_join')
  async handleJoinRoom(client: Socket, Authorization: string) {
    const user = await this.authService.getUserFromAuthToken(Authorization);
    if (user) {
      const clientRecord = clients.find((item) => item.userId === user.userId);
      if (clientRecord) {
        clients.splice(clients.indexOf(clientRecord));
      }
      clients.push(user);
      client.join(`client_${user.userId}`);
    }
  }

  @SubscribeMessage('event_leave')
  async handleRoomLeave(client: Socket, Authorization: string) {
    const user = await this.authService.getUserFromAuthToken(Authorization);
    if (user) {
      const clientRecord = clients.find((item) => item.userId === user.userId);
      if (clientRecord) {
        clients.splice(clients.indexOf(clientRecord));
      }
      client.leave(`client_${user.userId}`);
    }
  }

  @SubscribeMessage('event_message') //TODO Backend
  handleIncommingMessage(client: Socket, payload: { room: string; message: string }) {
    const { room, message } = payload;
    console.log(payload);
    this.server.to(`client_${room}`).emit('new_message', message);
  }

  sendNewNotification(userId: string, notification) {
    const findClient = clients.find((item) => item.userId === userId);
    if (findClient) {
      this.server.to(`client_${userId}`).emit('event_new_notification', notification);
    }
  }
}
