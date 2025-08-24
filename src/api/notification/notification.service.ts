import { Injectable } from '@nestjs/common';
import { NotificationEntity } from '@entities/notification.entity';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { createNotificationDto } from './notification.type';
import { UserEntity } from '@entities/user.entity';
import { NOTIFICATION_TYPES } from '@constants/notifications';
import { ROLES } from '@constants/roles';
import { SocketGateway } from '../../gateway/socket.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationRepository: Repository<NotificationEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly configService: ConfigService,
    private readonly socketGateway: SocketGateway,
  ) {}

  async createNotification(notification: createNotificationDto) {
    const roles: ROLES[] = [];
    switch (notification.type) {
      case NOTIFICATION_TYPES.SYSTEM:
        roles.push(ROLES.SUPER_ADMIN);
        roles.push(ROLES.ADMIN);
        roles.push(ROLES.SELLER);
        break;
      case NOTIFICATION_TYPES.AVAILABLE:
        roles.push(ROLES.SELLER);
        break;
      case NOTIFICATION_TYPES.NEW_RESERVATION:
        roles.push(ROLES.ADMIN);
        break;
      case NOTIFICATION_TYPES.NEW_SELL:
        roles.push(ROLES.ADMIN);
        break;
      default:
        break;
    }
    const users = await this.userRepository.find({ where: { companyId: notification.companyId, role: In(roles) } });
    users.forEach((user) => {
      this.notificationRepository
        .save({
          companyId: notification.companyId,
          userId: user.id,
          creationDate: notification.date,
          type: notification.type,
          url: notification.url,
        })
        .then((data) => {
          this.socketGateway.sendNewNotification(user.id, JSON.stringify(data));
        });
    });
  }

  async createUserNotification(notification: createNotificationDto, userId: string) {
    const user = await this.userRepository.findOne({ where: { companyId: notification.companyId, id: userId } });
    if (user) {
      this.notificationRepository
        .save({
          companyId: notification.companyId,
          userId: user.id,
          creationDate: new Date(),
          type: notification.type,
          url: notification.url,
        })
        .then((data) => {
          this.socketGateway.sendNewNotification(user.id, JSON.stringify(data));
        });
    }
  }

  async updateNotification(notification: NotificationEntity) {
    return this.notificationRepository.save(notification);
  }

  async getNotifications(): Promise<NotificationEntity[]> {
    return this.notificationRepository.find({
      order: { creationDate: 'DESC' },
    });
  }

  async getNotificationsByCompanyId(companyId: string): Promise<NotificationEntity[]> {
    return this.notificationRepository.find({ where: { companyId: companyId }, order: { creationDate: 'DESC' } });
  }

  async getNotificationById(notificationId: string): Promise<NotificationEntity | null> {
    return await this.notificationRepository.findOne({
      where: { id: notificationId },
      order: { creationDate: 'DESC' },
    });
  }

  async getNotificationsByUserId(userId: string): Promise<NotificationEntity[]> {
    return await this.notificationRepository.find({
      where: { userId: userId, read: false },
      order: { creationDate: 'DESC' },
    });
  }
}
