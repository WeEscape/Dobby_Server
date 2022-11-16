import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateGroupDto {
  @IsNotEmpty()
  @IsString()
  group_title: string;
}
