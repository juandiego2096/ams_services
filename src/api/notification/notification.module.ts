import { Module } from '@nestjs/common';
import { NotificationsService } from './notification.service';
import { NotificationsController } from './notification.controller';
import { NotificationEntity } from '@entities/notification.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GatewayModule } from '../../gateway/gateway.module';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationEntity]), GatewayModule],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationModule {}
