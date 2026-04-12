import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { WsService } from './ws-service';
import { IncomingMessage } from 'http';
import WebSocket from 'ws';

@WebSocketGateway({
  path: '/ws',
})
export class WsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly wsService: WsService) {}

  handleConnection(client: WebSocket, request: IncomingMessage) {
    const name = this.extractName(request);

    if (!name) {
      client.close(1008, 'Missing userId');
      return;
    }

    this.wsService.addClient(name, client);

    client.send(
      JSON.stringify({
        event: 'USER_ID',
        message: name,
      }),
    );
  }

  handleDisconnect(client: WebSocket) {
    this.wsService.removeClient(client);
  }

  private extractName(request: IncomingMessage): string | null {
    try {
      const url = new URL(request.url || '', 'http://localhost');
      return url.searchParams.get('name');
    } catch {
      return null;
    }
  }
}
