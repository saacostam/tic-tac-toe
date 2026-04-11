import { Body, Controller, Post } from '@nestjs/common';
import { UserUseCases } from '../app';

@Controller('users')
export class UserController {
  constructor(private userUC: UserUseCases) {}

  @Post()
  create(@Body() req: { name: string }) {
    return this.userUC.addUser(req.name);
  }
}
