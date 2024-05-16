import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Put,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AuthService } from './auth.service';
import { Public } from 'src/utils/decorators/public';
import {
  RegistrationInitializeDto,
  RegistrationFinalizeDto,
} from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { isNilOrEmpty, isPresent } from 'src/utils/helpers';
import { InvalidArguments } from 'src/utils/exceptions';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('register')
  registrationInitialized(@Body() body: RegistrationInitializeDto) {
    return this.authService.register(body);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Put('register')
  registrationFinalize(@Body() body: RegistrationFinalizeDto) {
    return this.authService.registerEmailVerification(body);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() body: LoginDto) {
    if (isNilOrEmpty(body.email) && isNilOrEmpty(body.username)) {
      throw new InvalidArguments();
    }

    if (isPresent(body.email) && isPresent(body.username)) {
      throw new InvalidArguments();
    }

    return this.authService.login(body);
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleClearUnusedAuthLeads() {
    console.log('Called handleClearUnusedAuthLeads cron');

    const { numberOfRowsAffected } =
      await this.authService.clearUnusedAuthLeads();

    console.log(`Cleared ${numberOfRowsAffected} unused auth leads`);
  }
}
