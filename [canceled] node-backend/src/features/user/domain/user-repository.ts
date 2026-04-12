import { IUser } from './user-entity';

export interface IUserRepository {
  createUser(name: string): Promise<IUser>;
  getUserById(id: string): Promise<IUser | null>;
  removeUser(id: string): Promise<void>;
}

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
