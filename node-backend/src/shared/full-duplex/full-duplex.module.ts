import { Module } from '@nestjs/common';
import { WsFullDuplexAdapter, WsGateway, WsService } from './infra';

@Module({
  providers: [
    WsGateway,
    WsService,
    WsFullDuplexAdapter,
    {
      provide: 'FULL_DUPLEX_ADAPTER',
      useExisting: WsFullDuplexAdapter,
    },
  ],
  exports: ['FULL_DUPLEX_ADAPTER'],
})
export class FullDuplexModule {}
