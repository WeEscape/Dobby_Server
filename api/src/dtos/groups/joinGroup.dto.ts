import { IsNotEmpty, IsString, Length } from 'class-validator';

export class JoinGroupDto {
  @IsNotEmpty()
  @IsString()
  @Length(6)
  invite_code: string;
}
