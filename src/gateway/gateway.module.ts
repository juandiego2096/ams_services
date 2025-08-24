import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { UserModule } from '../api/user/user.module';
import { AuthService } from '../api/auth/auth.service';

@Module({
  imports: [UserModule],
  providers: [SocketGateway, AuthService],
  exports: [SocketGateway],
})
export class GatewayModule {}
