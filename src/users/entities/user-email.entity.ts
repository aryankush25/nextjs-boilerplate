import {
  AfterCreate,
  AfterDestroy,
  AfterUpdate,
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  DefaultScope,
  ForeignKey,
  IsUUID,
  Model,
  PrimaryKey,
  Scopes,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { User } from './user.entity';

@DefaultScope(() => ({
  attributes: {
    exclude: ['otp', 'verificationToken'],
  },
}))
@Scopes(() => ({
  withEmailVerificationFields: {
    attributes: { include: ['otp', 'verificationToken'] },
  },
}))
@Table({ underscored: true })
export class UserEmail extends Model {
  @IsUUID(4)
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  id: string;

  @Column({ allowNull: false })
  email: string;

  @ForeignKey(() => User)
  @Column({ allowNull: false, type: DataType.UUID })
  userId: string;

  @BelongsTo(() => User)
  user: User;

  @Column({ allowNull: false, defaultValue: false })
  isPrimary: boolean;

  @Column({ allowNull: false, defaultValue: false })
  isVerified: boolean;

  @Column
  otp: string;

  @Column(DataType.TEXT)
  verificationToken: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @AfterCreate
  @AfterUpdate
  @AfterDestroy
  static sanitize(instance: User) {
    delete instance['dataValues'].otp;
    delete instance['dataValues'].verificationToken;
  }

  toJSON() {
    const attributes = super.toJSON();

    delete attributes.otp;
    delete attributes.verificationToken;

    return attributes;
  }
}
