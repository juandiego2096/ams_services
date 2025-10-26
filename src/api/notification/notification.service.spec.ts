import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notification.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotificationEntity } from '@entities/notification.entity';
import { UserEntity } from '@entities/user.entity';
import { Repository, In } from 'typeorm';
import { NotificationsPublisher } from './notifications.publisher';
import { NOTIFICATION_TYPES } from '@constants/notifications';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let notificationRepository: jest.Mocked<Repository<NotificationEntity>>;
  let userRepository: jest.Mocked<Repository<UserEntity>>;
  let publisher: jest.Mocked<NotificationsPublisher>;

  const notificationToken = getRepositoryToken(NotificationEntity);
  const userToken = getRepositoryToken(UserEntity);

  beforeEach(async () => {
    const notificationRepoMock: Partial<jest.Mocked<Repository<NotificationEntity>>> = {
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
    };
    const userRepoMock: Partial<jest.Mocked<Repository<UserEntity>>> = {
      find: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: notificationToken, useValue: notificationRepoMock },
        { provide: userToken, useValue: userRepoMock },
        {
          provide: NotificationsPublisher,
          useValue: {
            publish: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    notificationRepository = module.get(notificationToken);
    userRepository = module.get(userToken);
    publisher = module.get(NotificationsPublisher) as jest.Mocked<NotificationsPublisher>;
  });

  afterEach(() => jest.clearAllMocks());

  it('should create notifications for each matching user role', async () => {
    const date = new Date();
    userRepository.find.mockResolvedValue([
      { id: 'user-1', companyId: 'company-1' } as UserEntity,
      { id: 'user-2', companyId: 'company-1' } as UserEntity,
    ]);
    notificationRepository.save.mockResolvedValue({ id: 'notif-1' } as NotificationEntity);

    await service.createNotification({
      companyId: 'company-1',
      type: NOTIFICATION_TYPES.NEW_RESERVATION,
      url: '/reservation',
      date,
    });
    await Promise.resolve();

    expect(userRepository.find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { companyId: 'company-1', role: In(expect.any(Array)) },
      }),
    );
    expect(notificationRepository.save).toHaveBeenCalledTimes(2);
    expect(publisher.publish).toHaveBeenCalledTimes(2);
  });

  it('should create single user notification when user exists', async () => {
    userRepository.findOne.mockResolvedValue({ id: 'user-1', companyId: 'company-1' } as UserEntity);
    notificationRepository.save.mockResolvedValue({ id: 'notif-1' } as NotificationEntity);

    await service.createUserNotification(
      {
        companyId: 'company-1',
        type: NOTIFICATION_TYPES.SYSTEM,
        url: '/system',
        date: new Date(),
      },
      'user-1',
    );
    await Promise.resolve();

    expect(notificationRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        companyId: 'company-1',
      }),
    );
    expect(publisher.publish).toHaveBeenCalledWith('user-1', expect.any(Object));
  });

  it('should return notifications ordered by creation date', async () => {
    notificationRepository.find.mockResolvedValue([]);

    await service.getNotifications();

    expect(notificationRepository.find).toHaveBeenCalledWith(
      expect.objectContaining({
        order: { creationDate: 'DESC' },
      }),
    );
  });

  it('should fetch notification by id using repository', async () => {
    notificationRepository.findOne.mockResolvedValue(null);

    await service.getNotificationById('notif-1');

    expect(notificationRepository.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'notif-1' },
      }),
    );
  });
});
