import { Injectable } from '@nestjs/common';
import WebSocket from 'ws';

@Injectable()
export class WsService {
  private clients = new Map<string, WebSocket>();

  addClient(userId: string, client: WebSocket) {
    this.clients.set(userId, client);
  }

  removeClient(client: WebSocket): string | null {
    for (const [userId, storedClient] of this.clients.entries()) {
      if (storedClient === client) {
        this.clients.delete(userId);
        return userId;
      }
    }
    return null;
  }

  sendToUser(userId: string, event: string, payload: any) {
    const client = this.clients.get(userId);

    if (client && client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          event,
          message: payload as unknown,
        }),
      );
    }
  }

  broadcast(event: string) {
    const message = JSON.stringify({
      event,
    });

    for (const client of this.clients.values()) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    }
  }
}
