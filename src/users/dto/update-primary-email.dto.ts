import { IsEmail } from 'class-validator';

export class UpdatePrimaryEmailDto {
  @IsEmail()
  email: string;
}
