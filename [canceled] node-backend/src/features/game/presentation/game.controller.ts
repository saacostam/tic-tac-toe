import { Controller, Get, Param } from '@nestjs/common';
import { GameUseCases } from '../app';
import { UserIdParam } from './dtos';

@Controller('games')
export class GameController {
  constructor(private gameUC: GameUseCases) {}

  @Get('user-id/:userId')
  async queryUserGames(@Param() params: UserIdParam) {
    return this.gameUC.queryUserGame(params['userId']);
  }
}
