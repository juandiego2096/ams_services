import { Controller, Get, HttpException, HttpStatus, Param, Patch, Request, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notification.service';
import { NotificationEntity } from '@entities/notification.entity';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('notifications/:companyId')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('getMyNotifications')
  async getUsers(@Request() req): Promise<NotificationEntity[]> {
    return await this.notificationsService.getNotificationsByUserId(req.userId);
  }

  @Patch('updateNotificationAsRead/:notificationId')
  async updateNotificationAsRead(@Param('notificationId') notificationId: string): Promise<NotificationEntity> {
    const notification = await this.notificationsService.getNotificationById(notificationId);
    if (!notification) throw new HttpException('Notification not found', HttpStatus.NOT_FOUND);
    if (notification) {
      notification.read = true;
    }
    return await this.notificationsService.updateNotification(notification);
  }
}
