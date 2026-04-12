import { Module } from '@nestjs/common';
import { WsEventAdapter, WsGateway, WsService } from './infra';

@Module({
  providers: [
    WsGateway,
    WsService,
    WsEventAdapter,
    {
      provide: 'EVENT_ADAPTER',
      useExisting: WsEventAdapter,
    },
  ],
  exports: ['EVENT_ADAPTER'],
})
export class WsModule {}
