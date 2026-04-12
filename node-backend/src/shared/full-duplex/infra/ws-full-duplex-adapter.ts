import { Injectable } from '@nestjs/common';
import { WsService } from './ws-service';
import {
  IFullDuplexAdapter,
  IFullDuplexAdapterPayload,
} from 'src/shared/full-duplex/domain';

@Injectable()
export class WsFullDuplexAdapter implements IFullDuplexAdapter {
  constructor(private readonly wsService: WsService) {}

  async publish(args: IFullDuplexAdapterPayload['PublishIn']): Promise<void> {
    this.wsService.sendToUser(args.id, args.event, args.message);
  }

  async broadcast(
    args: IFullDuplexAdapterPayload['BroadcastIn'],
  ): Promise<void> {
    this.wsService.broadcast(args.event);
  }
}
