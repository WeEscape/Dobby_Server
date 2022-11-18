import { IsNotEmpty, IsString } from 'class-validator';

export class GetTokensDto {
  @IsNotEmpty()
  @IsString()
  refresh_token: string;
}
