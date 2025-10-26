import { Injectable } from '@nestjs/common';
import { NotificationEntity } from '@entities/notification.entity';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { createNotificationDto } from './notification.type';
import { UserEntity } from '@entities/user.entity';
import { NOTIFICATION_TYPES } from '@constants/notifications';
import { ROLES } from '@constants/roles';
import { NotificationsPublisher } from './notifications.publisher';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationRepository: Repository<NotificationEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly publisher: NotificationsPublisher,
  ) {}

  async createNotification(notification: createNotificationDto) {
    const roles = this.resolveRoles(notification.type);
    const users = await this.userRepository.find({ where: { companyId: notification.companyId, role: In(roles) } });
    await Promise.all(
      users.map(async (user) => {
        const storedNotification = await this.notificationRepository.save({
          companyId: notification.companyId,
          userId: user.id,
          creationDate: notification.date,
          type: notification.type,
          url: notification.url,
        });
        this.publisher.publish(user.id, storedNotification);
      }),
    );
  }

  async createUserNotification(notification: createNotificationDto, userId: string) {
    const user = await this.userRepository.findOne({ where: { companyId: notification.companyId, id: userId } });
    if (user) {
      const storedNotification = await this.notificationRepository.save({
        companyId: notification.companyId,
        userId: user.id,
        creationDate: new Date(),
        type: notification.type,
        url: notification.url,
      });
      this.publisher.publish(user.id, storedNotification);
    }
  }

  private resolveRoles(type: NOTIFICATION_TYPES): ROLES[] {
    switch (type) {
      case NOTIFICATION_TYPES.SYSTEM:
        return [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SELLER];
      case NOTIFICATION_TYPES.AVAILABLE:
        return [ROLES.SELLER];
      case NOTIFICATION_TYPES.NEW_RESERVATION:
      case NOTIFICATION_TYPES.NEW_SELL:
        return [ROLES.ADMIN];
      default:
        return [];
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
