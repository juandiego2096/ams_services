import { registerAs } from '@nestjs/config';

export interface AppConfig {
  server: {
    port: number;
    host: string;
  };
  jwt: {
    secret: string;
    expiration: string;
  };
  hash: {
    salt: number;
  };
  files: {
    path: string;
    uploadFolder: string;
  };
}

export default registerAs(
  'app',
  (): AppConfig => ({
    server: {
      port: Number(process.env.SERVICE_PORT ?? 3000),
      host: process.env.SERVICE_HOST ?? '0.0.0.0',
    },
    jwt: {
      secret: process.env.JWT_SECRET ?? '',
      expiration: process.env.JWT_EXPIRATION ?? '1h',
    },
    hash: {
      salt: Number(process.env.HASH_SALT ?? 10),
    },
    files: {
      path: process.env.FILES_PATH ?? './',
      uploadFolder: process.env.FILES_UPLOAD_FOLDER ?? '/uploads',
    },
  }),
);
