import { IsString, MinLength } from 'class-validator';

export class UserIdParam {
  @IsString()
  @MinLength(1)
  'userId'!: string;
}
