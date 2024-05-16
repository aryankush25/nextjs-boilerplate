import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../entities/user.entity';
import { UserEmail } from '../entities/user-email.entity';
import {
  comparePassword,
  hashPassword,
  removeUndefinedKeys,
} from 'src/utils/helpers';
import { InvalidUser } from 'src/utils/exceptions';
import { CreateUser, UpdateUser } from '../types/user.type';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
    @InjectModel(UserEmail)
    private userEmailModel: typeof UserEmail,
  ) {}
  async create({ name, email, username, password }: CreateUser) {
    const user = await this.userModel.create(
      {
        name,
        username,
        password,
        emails: [
          {
            email,
            isPrimary: true,
            isVerified: true,
          },
        ],
      },
      {
        include: [this.userEmailModel],
      },
    );

    return user;
  }

  async addUserEmail({ userId, email }: { userId: string; email: string }) {
    const userEmail = await this.userEmailModel.create(
      {
        email,
        userId,
      },
      {
        include: [this.userModel],
      },
    );

    return userEmail;
  }

  async updateUserEmail(
    payload: {
      otp?: string | null;
      verificationToken?: string | null;
      isVerified?: boolean;
      isPrimary?: boolean;
    },
    filters: {
      userId: string;
      email: string;
      isVerified?: boolean;
      isPrimary?: boolean;
      otp?: string;
      verificationToken?: string;
    },
  ) {
    return this.userEmailModel.update(payload, {
      where: filters,
    });
  }

  async findOne(
    {
      id,
      username,
      otp,
      verificationToken,
    }: {
      id?: string;
      username?: string;
      otp?: string;
      verificationToken?: string;
    },
    associationParams?: {
      email: string;
      isVerified?: boolean;
      isPrimary?: boolean;
    },
  ) {
    if (associationParams?.email) {
      const emailRecord = await this.userEmailModel.findOne({
        where: removeUndefinedKeys({
          userId: id,
          email: associationParams.email,
          isVerified: associationParams.isVerified,
          isPrimary: associationParams.isPrimary,
        }),
      });

      if (!emailRecord) {
        return null;
      }

      if (!id) {
        id = emailRecord.userId;
      }
    }

    const user = await this.userModel.findOne({
      where: removeUndefinedKeys({
        id,
        username,
        otp,
        verificationToken,
      }),
      include: [this.userEmailModel],
    });

    return user;
  }

  async verifyPassword(id: string, password: string) {
    const user = await this.userModel.scope('withPassword').findOne({
      where: removeUndefinedKeys({
        id,
      }),
    });

    if (!user) {
      throw new InvalidUser();
    }

    return comparePassword(password, user.password);
  }

  async update(id: string, updateUserDto: UpdateUser) {
    if (updateUserDto.password) {
      updateUserDto.password = await hashPassword(updateUserDto.password);
    }

    return this.userModel.update(updateUserDto, {
      where: { id },
    });
  }

  remove(id: string) {
    return this.userModel.destroy({
      where: { id },
    });
  }

  removeEmail(userId: string, email: string) {
    return this.userEmailModel.destroy({
      where: { userId, email, isPrimary: false },
    });
  }
}
