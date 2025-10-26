import { Injectable } from '@nestjs/common';
import { SocketGateway } from '../../gateway/socket.gateway';

@Injectable()
export class NotificationsPublisher {
  constructor(private readonly socketGateway: SocketGateway) {}

  publish(userId: string, payload: unknown): void {
    this.socketGateway.sendNewNotification(userId, JSON.stringify(payload));
  }
}
