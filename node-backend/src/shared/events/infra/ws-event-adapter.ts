import { Injectable } from '@nestjs/common';
import { WsGatewayService } from './ws-gateway-service';
import { IEventAdapter, IEventAdapterPayload } from '../domain';

@Injectable()
export class WsEventAdapter implements IEventAdapter {
  constructor(private ws: WsGatewayService) {}

  async publish(args: IEventAdapterPayload['PublishIn']): Promise<void> {
    this.ws.sendToUser(args.id, {
      event: args.event,
      message: args.message,
    });
  }

  async broadcast(args: IEventAdapterPayload['BroadcastIn']): Promise<void> {
    this.ws.broadcast({
      event: args.event,
    });
  }
}
