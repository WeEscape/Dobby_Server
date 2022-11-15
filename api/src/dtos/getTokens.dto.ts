import { IsNotEmpty, IsString } from 'class-validator';

export class GetTokens {
  @IsNotEmpty()
  @IsString()
  refresh_token: string;
}
