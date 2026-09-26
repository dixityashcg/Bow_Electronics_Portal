import { Module } from '@nestjs/common';
import { AccessController } from './access.controller.ts';
import { AccessService } from './access.service.ts';
import { NamedUsersService } from './named-users.service.ts';

@Module({
  controllers: [AccessController],
  providers: [AccessService, NamedUsersService],
  exports: [AccessService],
})
export class AccessModule {}
