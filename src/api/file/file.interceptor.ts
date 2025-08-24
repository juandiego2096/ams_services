import { ConfigService } from '@nestjs/config';

export const fileDestination = (req, file, cb) => {
  const configService = new ConfigService();
  cb(null, configService.get('FILES_PATH', './') + configService.get('FILES_UPLOAD_FOLDER', '/uploads'));
};
