import { Module } from '@nestjs/common';
import { NotificationsService } from './notification.service';
import { NotificationsController } from './notification.controller';
import { NotificationEntity } from '@entities/notification.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GatewayModule } from '../../gateway/gateway.module';
import { UserEntity } from '@entities/user.entity';
import { NotificationsPublisher } from './notifications.publisher';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationEntity, UserEntity]), GatewayModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsPublisher],
  exports: [NotificationsService],
})
export class NotificationModule {}
