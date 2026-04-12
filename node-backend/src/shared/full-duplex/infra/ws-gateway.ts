import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { WsService } from './ws-service';
import WebSocket, { Server } from 'ws';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IEvents } from 'src/shared/events/domain';

@WebSocketGateway({
  path: '/ws',
})
export class WsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly wsService: WsService,
    private eventEmitter: EventEmitter2,
  ) {}

  @WebSocketServer()
  server!: Server;

  handleConnection(client: WebSocket) {
    client.on('message', (raw) => {
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      const data = JSON.parse(raw.toString()) as unknown;

      const event = this.safeExtractField(data, 'event');
      const message = this.safeExtractField(data, 'message');

      /**
       * What we do if request is invalid
       */
      const notValid = () => {
        client.close();
      };

      if (!event) return notValid();

      switch (event) {
        case 'CONNECT': {
          if (!message) return notValid();

          this.eventEmitter.emit(IEvents.Connected, {
            name: message,
            ws: client,
          });
        }
      }
    });
  }

  async handleDisconnect(client: WebSocket) {
    const userId = this.wsService.removeClient(client);

    if (userId) {
      this.eventEmitter.emit(IEvents.Disconnected, {
        userId,
      });
    }
  }

  private safeExtractField(p: unknown, key: string): string | null {
    if (typeof p !== 'object' || p === null) return null;
    const value = (p as Record<string, unknown>)[key];
    if (typeof value === 'string') return value;
    return null;
  }
}
