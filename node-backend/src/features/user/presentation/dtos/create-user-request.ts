import { IsString, MinLength } from 'class-validator';

export class CreateUserRequest {
  @IsString()
  @MinLength(1)
  name!: string;
}
