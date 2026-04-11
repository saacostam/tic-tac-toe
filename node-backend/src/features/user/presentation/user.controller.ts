import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UserUseCases } from '../app';
import { CreateUserRequest, UserIdParam } from './dtos';

@Controller('users')
export class UserController {
  constructor(private userUC: UserUseCases) {}

  @Post()
  create(@Body() req: CreateUserRequest) {
    return this.userUC.addUser(req.name);
  }

  @Get(':id')
  getById(@Param() params: UserIdParam) {
    return this.userUC.getUser(params.id);
  }
}
