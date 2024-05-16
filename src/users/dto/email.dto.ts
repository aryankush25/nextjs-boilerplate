import { IsEmail } from 'class-validator';

export class DeleteEmailDto {
  @IsEmail()
  email: string;
}
