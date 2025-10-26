import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import appConfig from './app.config';

@Injectable()
export class AppConfigService {
  constructor(@Inject(appConfig.KEY) private readonly config: ConfigType<typeof appConfig>) {}

  get serverPort(): number {
    return this.config.server.port;
  }

  get serverHost(): string {
    return this.config.server.host;
  }

  get jwtSecret(): string {
    return this.config.jwt.secret;
  }

  get jwtExpiration(): string {
    return this.config.jwt.expiration;
  }

  get hashSalt(): number {
    return this.config.hash.salt;
  }

  get filesPath(): string {
    return this.config.files.path;
  }

  get filesUploadFolder(): string {
    return this.config.files.uploadFolder;
  }
}
