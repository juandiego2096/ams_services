import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig from './app.config';
import { AppConfigService } from './configuration.service';

@Global()
@Module({
  imports: [ConfigModule.forFeature(appConfig)],
  providers: [AppConfigService],
  exports: [AppConfigService],
})
export class ConfigurationModule {}
