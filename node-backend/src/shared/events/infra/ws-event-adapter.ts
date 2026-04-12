import { Injectable } from '@nestjs/common';
import { WsService } from './ws-service';
import { IEventAdapter, IEventAdapterPayload } from 'src/shared/events/domain';

@Injectable()
export class WsEventAdapter implements IEventAdapter {
  constructor(private readonly wsService: WsService) {}

  async publish(args: IEventAdapterPayload['PublishIn']): Promise<void> {
    this.wsService.sendToUser(args.id, args.event, args.message);
  }

  async broadcast(args: IEventAdapterPayload['BroadcastIn']): Promise<void> {
    this.wsService.broadcast(args.event);
  }
}
