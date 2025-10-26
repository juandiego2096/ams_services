import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notification.controller';
import { NotificationsService } from './notification.service';
import { AuthGuard } from '../auth/auth.guard';
import { NotificationEntity } from '@entities/notification.entity';
import { HttpException } from '@nestjs/common';

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let service: jest.Mocked<NotificationsService>;

  beforeEach(async () => {
    const moduleBuilder = Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        {
          provide: NotificationsService,
          useValue: {
            getNotificationsByUserId: jest.fn(),
            getNotificationById: jest.fn(),
            updateNotification: jest.fn(),
          },
        },
      ],
    });

    const module: TestingModule = await moduleBuilder
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn().mockResolvedValue(true) })
      .compile();

    controller = module.get<NotificationsController>(NotificationsController);
    service = module.get(NotificationsService) as jest.Mocked<NotificationsService>;
  });

  afterEach(() => jest.clearAllMocks());

  it('should return notifications for current user', async () => {
    const notifications = [{ id: 'notif-1' } as NotificationEntity];
    service.getNotificationsByUserId.mockResolvedValue(notifications);

    const result = await controller.getUsers({ userId: 'user-1' } as any);

    expect(service.getNotificationsByUserId).toHaveBeenCalledWith('user-1');
    expect(result).toBe(notifications);
  });

  it('should mark notification as read when exists', async () => {
    const notification = { id: 'notif-1', read: false } as NotificationEntity;
    service.getNotificationById.mockResolvedValue(notification);
    service.updateNotification.mockResolvedValue({ ...notification, read: true });

    await controller.updateNotificationAsRead('notif-1');

    expect(service.getNotificationById).toHaveBeenCalledWith('notif-1');
    expect(service.updateNotification).toHaveBeenCalledWith(expect.objectContaining({ read: true }));
  });

  it('should throw when notification not found', async () => {
    service.getNotificationById.mockResolvedValue(null);

    await expect(controller.updateNotificationAsRead('missing')).rejects.toBeInstanceOf(HttpException);
    expect(service.updateNotification).not.toHaveBeenCalled();
  });
});
