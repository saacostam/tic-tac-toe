import { Controller, Get, Param } from '@nestjs/common';
import { UserUseCases } from '../app';
import { UserIdParam } from './dtos';

@Controller('users')
export class UserController {
  constructor(private userUC: UserUseCases) {}

  @Get(':id')
  getById(@Param() params: UserIdParam) {
    return this.userUC.getUser(params.id);
  }
}
