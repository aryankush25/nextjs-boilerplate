import { OmitType, PartialType } from '@nestjs/mapped-types';

export class CreateUser {
  name: string;
  email: string;
  username: string;
  password: string;
}

export class UpdateUser extends PartialType(
  OmitType(CreateUser, ['email'] as const),
) {
  otp?: string | null;
  verificationToken?: string | null;
}
