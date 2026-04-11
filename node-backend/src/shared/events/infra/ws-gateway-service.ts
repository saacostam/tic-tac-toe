import { Injectable, OnModuleInit } from '@nestjs/common';
import { WebSocketServer } from 'ws';
import * as http from 'http';
import { IncomingMessage } from 'http';
import { WebSocket } from 'ws';

@Injectable()
export class WsGatewayService implements OnModuleInit {
  private wss!: WebSocketServer;

  private clients = new Map<string, WebSocket>();

  onModuleInit() {
    const server = http.createServer();

    this.wss = new WebSocketServer({ noServer: true });

    server.on('upgrade', (req: IncomingMessage, socket, head) => {
      const url = req.url ?? '';

      // expected: /ws/{name}
      const match = url.match(/^\/ws\/(.+)$/);

      if (!match) {
        socket.destroy();
        return;
      }

      const userId = decodeURIComponent(match[1]);

      this.wss.handleUpgrade(req, socket, head, (ws) => {
        this.handleConnection(ws, userId);
      });
    });

    server.listen(3000);
  }

  private handleConnection(ws: WebSocket, userId: string) {
    this.clients.set(userId, ws);

    ws.on('close', () => {
      this.clients.delete(userId);
    });
  }

  sendToUser(userId: string, payload: any) {
    const ws = this.clients.get(userId);
    if (!ws) return;

    ws.send(JSON.stringify(payload));
  }

  broadcast(payload: any) {
    for (const ws of this.clients.values()) {
      ws.send(JSON.stringify(payload));
    }
  }
}
