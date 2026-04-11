import { Body, Controller, Post } from '@nestjs/common';
import { UserUseCases } from '../app';
import { CreateUserRequest } from './dtos';

@Controller('users')
export class UserController {
  constructor(private userUC: UserUseCases) {}

  @Post()
  create(@Body() req: CreateUserRequest) {
    return this.userUC.addUser(req.name);
  }
}
