import { HttpException, HttpStatus } from '@nestjs/common';

export class CustomException extends HttpException {
  constructor(
    message: string,
    name: string = 'InternalServerError',
    status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    cause: unknown = new Error(),
  ) {
    super(
      {
        message,
        name,
        statusCode: status,
      },
      status,
      { cause },
    );
  }
}

export class Unauthorized extends CustomException {
  constructor() {
    super('Unauthorized', 'Unauthorized', HttpStatus.UNAUTHORIZED);
  }
}

export class InvalidArguments extends CustomException {
  constructor() {
    super('Invalid arguments', 'InvalidArguments', HttpStatus.NOT_ACCEPTABLE);
  }
}

export class InvalidUser extends CustomException {
  constructor() {
    super('User does not exist', 'InvalidUser', HttpStatus.NOT_FOUND);
  }
}

export class CanNotPerformActionOnOwn extends CustomException {
  constructor() {
    super(
      'You can not perform this action on yourself',
      'CanNotPerformActionOnOwn',
      HttpStatus.NOT_ACCEPTABLE,
    );
  }
}

export class SomethingWentWrong extends CustomException {
  constructor() {
    super(
      'Something Went Wrong',
      'SomethingWentWrong',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

export class InvalidUsername extends CustomException {
  constructor() {
    super(
      'Account does not exist with this username',
      'InvalidUsername',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

export class InvalidVerifiedEmail extends CustomException {
  constructor() {
    super(
      'Account does not exist with this email or use a verified email to continue',
      'InvalidVerifiedEmail',
      HttpStatus.NOT_ACCEPTABLE,
    );
  }
}

export class PreviouslyUsedPassword extends CustomException {
  constructor() {
    super(
      'Please choose a different password as it is previously used',
      'PreviouslyUsedPassword',
      HttpStatus.NOT_ACCEPTABLE,
    );
  }
}

export class SameCurrentUsername extends CustomException {
  constructor() {
    super(
      'Please choose a different username as it is the same as the current one',
      'SameCurrentUsername',
      HttpStatus.NOT_ACCEPTABLE,
    );
  }
}

export class DuplicateUsername extends CustomException {
  constructor() {
    super(
      'Username already belongs to someone else',
      'DuplicateUsername',
      HttpStatus.NOT_ACCEPTABLE,
    );
  }
}

export class DuplicateEmail extends CustomException {
  constructor() {
    super(
      'Email already belongs to someone else',
      'DuplicateEmail',
      HttpStatus.NOT_ACCEPTABLE,
    );
  }
}

export class WrongPassword extends CustomException {
  constructor() {
    super('Password is incorrect', 'WrongPassword', HttpStatus.UNAUTHORIZED);
  }
}

export class EmailBelongsToSomeoneElse extends CustomException {
  constructor() {
    super(
      'This email belongs to someone else',
      'EmailBelongsToSomeoneElse',
      HttpStatus.CONFLICT,
    );
  }
}

export class EmailAlreadyVerified extends CustomException {
  constructor() {
    super(
      'This email is already verified',
      'EmailAlreadyVerified',
      HttpStatus.CONFLICT,
    );
  }
}

export class CannotLinkMoreThan10Email extends CustomException {
  constructor() {
    super(
      "Can't link more than 10 emails to a single account",
      'CannotLinkMoreThan10Email',
      HttpStatus.CONFLICT,
    );
  }
}

export class InvalidOtp extends CustomException {
  constructor() {
    super('Invalid OTP', 'InvalidOtp', HttpStatus.NOT_ACCEPTABLE);
  }
}

export class CanNotDeletePrimaryEmail extends CustomException {
  constructor() {
    super(
      'Primary email can not be deleted',
      'CanNotDeletePrimaryEmail',
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class MinimumOneEmailIsRequired extends CustomException {
  constructor() {
    super(
      'Minimum one email is required to be connected to an account',
      'MinimumOneEmailIsRequired',
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class AlreadyPrimaryEmail extends CustomException {
  constructor(email: string) {
    super(
      email + ' is already a primary email',
      'AlreadyPrimaryEmail',
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class VerifyEmail extends CustomException {
  constructor() {
    super('Please verify this email', 'VerifyEmail', HttpStatus.BAD_REQUEST);
  }
}

export class VerifyOrAddEmail extends CustomException {
  constructor() {
    super(
      'Email not verified or connected to any account',
      'VerifyOrAddEmail',
      HttpStatus.BAD_REQUEST,
    );
  }
}
