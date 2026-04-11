import { IUser, IUserRepository } from '../domain';

export class InMemoryUserRepository implements IUserRepository {
  private users: IUser[] = [];

  async createUser(name: string): Promise<IUser> {
    const user: IUser = { id: crypto.randomUUID(), name };
    this.users.push(user);
    return user;
  }

  async getUserById(id: string): Promise<IUser | null> {
    return this.users.find((u) => u.id === id) ?? null;
  }

  async removeUser(id: string): Promise<void> {
    this.users = this.users.filter((u) => u.id !== id);
  }
}
