import { Module } from '@nestjs/common';
import { WsEventAdapter, WsGatewayService } from './infra';

@Module({
  providers: [
    WsGatewayService,
    WsEventAdapter,
    {
      provide: 'EVENT_ADAPTER',
      useExisting: WsEventAdapter,
    },
  ],
  exports: ['EVENT_ADAPTER'],
})
export class EventsModule {}
