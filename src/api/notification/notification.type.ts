import { NOTIFICATION_TYPES } from '@constants/notifications';

export class createNotificationDto {
  companyId: string;
  type: NOTIFICATION_TYPES;
  date: Date;
  url: string;
}
