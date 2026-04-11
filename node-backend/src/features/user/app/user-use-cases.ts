import { Inject, Injectable } from '@nestjs/common';
import { IUser, USER_REPOSITORY, type IUserRepository } from '../domain';
import { BaseDomainError, DomainErrorType } from 'src/shared/errors/domain';

@Injectable()
export class UserUseCases {
  constructor(
    @Inject(USER_REPOSITORY)
    private userRepo: IUserRepository,
  ) {}

  addUser(name: string) {
    return this.userRepo.createUser(name);
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
