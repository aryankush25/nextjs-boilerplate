import {
  Body,
  Controller,
  Delete,
  Get,
  Put,
  Post,
  Request,
  Patch,
} from '@nestjs/common';
import { UsersService } from './services/users.service';
import { CurrentUser } from 'src/utils/decorators/current-user';
import { User } from './entities/user.entity';
import {
  EmailVerificationFinalizeDto,
  EmailVerificationInitializeDto,
} from './dto/email-verification.dto';
import {
  AlreadyPrimaryEmail,
  CanNotDeletePrimaryEmail,
  CannotLinkMoreThan10Email,
  DuplicateUsername,
  EmailAlreadyVerified,
  EmailBelongsToSomeoneElse,
  InvalidArguments,
  InvalidOtp,
  InvalidUsername,
  InvalidVerifiedEmail,
  MinimumOneEmailIsRequired,
  PreviouslyUsedPassword,
  SameCurrentUsername,
  SomethingWentWrong,
  Unauthorized,
  VerifyEmail,
} from 'src/utils/exceptions';
import { JwtService } from '@nestjs/jwt';
import { applicationConfig } from 'config';
import {
  generateJwt,
  generateOtpAndVerificationToken,
  isNilOrEmpty,
  isPresent,
} from 'src/utils/helpers';
import { MailService } from 'src/mail/mail.service';
import { DeleteEmailDto } from './dto/email.dto';
import { UpdatePrimaryEmailDto } from './dto/update-primary-email.dto';
import { Public } from 'src/utils/decorators/public';
import {
  ForgotPasswordFinalizeDto,
  ForgotPasswordInitializeDto,
} from './dto/forgot-password.dto';
import { UpdateUserDto } from './dto/user.dto';
import { UpdateUsernameDto } from './dto/username.dto';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  @Get('me')
  getProfile(@Request() req: any) {
    return req.user;
  }

  @Post('email-verification')
  async emailVerificationInitialize(
    @CurrentUser() currentUser: User,
    @Body() body: EmailVerificationInitializeDto,
  ) {
    const user = await this.usersService.findOne(
      {},
      { email: body.email, isVerified: true },
    );

    if (user) {
      if (user.id === currentUser.id) {
        throw new EmailAlreadyVerified();
      } else {
        throw new EmailBelongsToSomeoneElse();
      }
    }

    const isEmailUnverifiedAndBelongsToCurrentUser = currentUser.emails.some(
      (x) => x.email === body.email && x.isVerified === false,
    );

    if (!isEmailUnverifiedAndBelongsToCurrentUser) {
      if (currentUser.emails.length >= 10) {
        throw new CannotLinkMoreThan10Email();
      }

      await this.usersService.addUserEmail({
        email: body.email,
        userId: currentUser.id,
      });
    }

    const { otp, verificationToken } = generateOtpAndVerificationToken(
      {
        email: body.email,
        userId: currentUser.id,
      },
      this.jwtService,
    );

    await this.usersService.updateUserEmail(
      {
        otp,
        verificationToken,
      },
      { email: body.email, userId: currentUser.id, isVerified: false },
    );

    await this.mailService.sendVerificationEmail(otp, body.email);

    return {
      verificationToken,
      expiresIn: applicationConfig.jwt.emailTokenExpiresIn,
    };
  }

  @Put('email-verification')
  async emailVerificationFinalize(
    @CurrentUser() currentUser: User,
    @Body() body: EmailVerificationFinalizeDto,
  ) {
    const payload = this.jwtService.verify(body.verificationToken, {
      secret: applicationConfig.jwt.secret,
    });

    const isEmailAddedToUserEmailList = currentUser.emails.some(
      (x) => x.email === payload.email,
    );

    if (
      isNilOrEmpty(payload.email) ||
      payload.userId !== currentUser.id ||
      !isEmailAddedToUserEmailList
    ) {
      throw new Unauthorized();
    }

    const user = await this.usersService.findOne(
      {},
      { email: payload.email, isVerified: true },
    );

    if (user) {
      if (user.id === currentUser.id) {
        throw new EmailAlreadyVerified();
      } else {
        throw new EmailBelongsToSomeoneElse();
      }
    }

    const [affectedCount] = await this.usersService.updateUserEmail(
      {
        otp: null,
        verificationToken: null,
        isVerified: true,
        isPrimary: !currentUser.emails.some((x) => x.isPrimary === true),
      },
      {
        email: payload.email,
        userId: currentUser.id,
        isVerified: false,
        otp: body.otp,
        verificationToken: body.verificationToken,
      },
    );

    if (affectedCount !== 1) {
      throw new InvalidOtp();
    }

    return { isVerified: true };
  }

  @Delete('email')
  async deleteConnectedEmail(
    @CurrentUser() currentUser: User,
    @Body() body: DeleteEmailDto,
  ) {
    if (currentUser.emails.length === 1) {
      throw new MinimumOneEmailIsRequired();
    }

    const userEmail = currentUser.emails.find((x) => x.email === body.email);

    if (!userEmail) {
      throw new InvalidArguments();
    }

    if (userEmail.isPrimary) {
      throw new CanNotDeletePrimaryEmail();
    }

    const deletedRows = await this.usersService.removeEmail(
      currentUser.id,
      body.email,
    );

    if (deletedRows !== 1) {
      throw new SomethingWentWrong();
    }

    return { isDeleted: true };
  }

  @Post('update-primary-email')
  async updatePrimaryEmail(
    @CurrentUser() currentUser: User,
    @Body() body: UpdatePrimaryEmailDto,
  ) {
    const userEmail = currentUser.emails.find((x) => x.email === body.email);

    if (!userEmail) {
      throw new InvalidArguments();
    }

    if (userEmail.isPrimary) {
      throw new AlreadyPrimaryEmail(body.email);
    }

    if (!userEmail.isVerified) {
      throw new VerifyEmail();
    }

    const [affectedCount] = await this.usersService.updateUserEmail(
      {
        isPrimary: false,
      },
      {
        userId: currentUser.id,
        isVerified: true,
        email: currentUser.primaryEmail.email,
        isPrimary: true,
      },
    );

    const [affectedCountNewPrimaryEmail] =
      await this.usersService.updateUserEmail(
        {
          isPrimary: true,
        },
        {
          userId: currentUser.id,
          isVerified: true,
          email: body.email,
          isPrimary: false,
        },
      );

    if (affectedCount !== 1 || affectedCountNewPrimaryEmail !== 1) {
      throw new SomethingWentWrong();
    }

    return { isUpdated: true };
  }

  @Patch('username')
  async updateUsername(
    @CurrentUser() currentUser: User,
    @Body() body: UpdateUsernameDto,
  ) {
    if (currentUser.username === body.username) {
      throw new SameCurrentUsername();
    }

    const isUsernameAlreadyTaken = isPresent(
      await this.usersService.findOne({
        username: body.username,
      }),
    );

    if (isUsernameAlreadyTaken) {
      throw new DuplicateUsername();
    }

    const [affectedCount] = await this.usersService.update(currentUser.id, {
      username: body.username,
    });

    if (affectedCount !== 1) {
      throw new SomethingWentWrong();
    }

    return generateJwt(
      {
        id: currentUser.id,
        username: body.username,
      },
      this.jwtService,
    );
  }

  @Patch()
  async updateUser(
    @CurrentUser() currentUser: User,
    @Body() body: UpdateUserDto,
  ) {
    // Description, profile picture, etc. can be added here
    const [affectedCount] = await this.usersService.update(currentUser.id, {
      name: body.name,
    });

    if (affectedCount !== 1) {
      throw new SomethingWentWrong();
    }

    return { isUpdated: true };
  }

  @Public()
  @Post('forgot-password')
  async forgotPasswordInitialize(@Body() body: ForgotPasswordInitializeDto) {
    if (isNilOrEmpty(body.email) && isNilOrEmpty(body.username)) {
      throw new InvalidArguments();
    }

    if (isPresent(body.email) && isPresent(body.username)) {
      throw new InvalidArguments();
    }

    let user: User | null;

    if (body.username) {
      user = await this.usersService.findOne({
        username: body.username,
      });
    } else {
      // Allow reset password only if email is verified
      user = await this.usersService.findOne(
        {},
        { email: body.email, isVerified: true },
      );
    }

    if (!user) {
      if (body.username) {
        throw new InvalidUsername();
      }

      throw new InvalidVerifiedEmail();
    }

    const { otp, verificationToken } = generateOtpAndVerificationToken(
      {
        email: body.email,
        userId: user.id,
        username: user.username,
      },
      this.jwtService,
    );

    const [affectedCount] = await this.usersService.update(user.id, {
      otp,
      verificationToken,
    });

    if (affectedCount !== 1) {
      throw new SomethingWentWrong();
    }

    if (body.email) {
      await this.mailService.sendPasswordResetVerificationEmail(
        otp,
        body.email,
      );
    } else {
      await Promise.all(
        user.emails
          .filter((x) => x.isVerified)
          .map((x) =>
            this.mailService.sendPasswordResetVerificationEmail(otp, x.email),
          ),
      );
    }

    return {
      verificationToken,
      expiresIn: applicationConfig.jwt.emailTokenExpiresIn,
    };
  }

  @Public()
  @Put('forgot-password')
  async forgotPasswordFinalize(@Body() body: ForgotPasswordFinalizeDto) {
    const payload = this.jwtService.verify(body.verificationToken, {
      secret: applicationConfig.jwt.secret,
    });

    const user = await this.usersService.findOne({
      username: payload.username,
      id: payload.id,
      otp: body.otp,
      verificationToken: body.verificationToken,
    });

    if (!user) {
      throw new Unauthorized();
    }

    const isMatch = await this.usersService.verifyPassword(
      user.id,
      body.password,
    );

    if (isMatch) {
      throw new PreviouslyUsedPassword();
    }

    const [affectedCount] = await this.usersService.update(user.id, {
      password: body.password,
      otp: null,
      verificationToken: null,
    });

    if (affectedCount !== 1) {
      throw new InvalidOtp();
    }

    return { isUpdated: true };
  }
}
