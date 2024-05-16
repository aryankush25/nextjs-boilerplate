import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';
import { NAME_MAX_LENGTH, NAME_MIN_LENGTH } from 'src/utils/constants';

export class UpdateUserDto {
  @MinLength(NAME_MIN_LENGTH)
  @MaxLength(NAME_MAX_LENGTH)
  @IsNotEmpty()
  name: string;

  // Description, profile picture, etc. can be added here
}
