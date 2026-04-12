import { Inject, Injectable } from '@nestjs/common';
import { IUser, USER_REPOSITORY, type IUserRepository } from '../domain';
import { BaseDomainError, DomainErrorType } from 'src/shared/errors/domain';
import { OnEvent } from '@nestjs/event-emitter';
import { IEvents } from 'src/shared/events/domain';
import {
  IFullDuplexEventType,
  type IFullDuplexAdapter,
} from 'src/shared/full-duplex/domain';
import { WebSocket } from 'ws';

@Injectable()
export class UserUseCases {
  constructor(
    @Inject(USER_REPOSITORY)
    private userRepo: IUserRepository,
    @Inject('FULL_DUPLEX_ADAPTER')
    private comm: IFullDuplexAdapter,
  ) {}

  // TODO: Fix leaky ws in app layer
  @OnEvent(IEvents.Connected)
  async addUser(payload: { name: string; ws: WebSocket }) {
    const user = await this.userRepo.createUser(payload.name);

    await this.comm.addClient(user.id, payload.ws);

    await this.comm.publish({
      id: user.id,
      event: IFullDuplexEventType.UserId,
      message: user.id,
    });
  }

  async getUser(userId: string): Promise<IUser | null> {
    const user = await this.userRepo.getUserById(userId);

    if (user === null) {
      throw new BaseDomainError({
        type: DomainErrorType.NOT_FOUND,
        message: `[UserUseCases.getUser] Cannot find user with id ${userId}`,
        userMessage: 'User not found',
      });
    }

    return user;
  }
}
