import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY, type IUserRepository } from '../domain';

@Injectable()
export class UserUseCases {
  constructor(
    @Inject(USER_REPOSITORY)
    private userRepo: IUserRepository,
  ) {}

  addUser(name: string) {
    return this.userRepo.createUser(name);
  }
}
