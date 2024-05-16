import {
  IsEmail,
  IsOptional,
  MinLength,
  MaxLength,
  IsJWT,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import {
  OTP_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from 'src/utils/constants';
import { IsUsername } from 'src/utils/custom-validators';

export class ForgotPasswordInitializeDto {
  @IsEmail()
  @IsOptional()
  email: string;

  @IsUsername()
  @IsOptional()
  username: string;
}

export class ForgotPasswordFinalizeDto {
  @IsJWT()
  verificationToken: string;

  @IsString()
  @MaxLength(OTP_LENGTH)
  @MinLength(OTP_LENGTH)
  otp: string;

  @MinLength(PASSWORD_MIN_LENGTH)
  @MaxLength(PASSWORD_MAX_LENGTH)
  @IsNotEmpty()
  password: string;
}
