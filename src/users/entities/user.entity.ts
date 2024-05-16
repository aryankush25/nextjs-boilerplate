import {
  AfterCreate,
  AfterDestroy,
  AfterUpdate,
  BelongsToMany,
  Column,
  CreatedAt,
  DataType,
  DefaultScope,
  HasMany,
  IsUUID,
  Model,
  PrimaryKey,
  Scopes,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { find } from 'lodash';
import { UserEmail } from './user-email.entity';

@DefaultScope(() => ({
  attributes: {
    exclude: ['password', 'otp', 'verificationToken'],
  },
}))
@Scopes(() => ({
  withPassword: {
    attributes: { include: ['password'] },
  },
  withPasswordResetFields: {
    attributes: { include: ['otp', 'verificationToken'] },
  },
}))
@Table({ underscored: true })
export class User extends Model {
  @IsUUID(4)
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  id: string;

  @Column({ allowNull: false })
  name: string;

  @HasMany(() => UserEmail)
  emails: UserEmail[];

  @Column({
    type: DataType.VIRTUAL,

    get(this) {
      return find(this.dataValues.emails, ['isPrimary', true]);
    },
  })
  primaryEmail: UserEmail;

  @Column({ allowNull: false, unique: true })
  username: string;

  @Column({ allowNull: false })
  password: string;

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
    delete instance['dataValues'].password;
    delete instance['dataValues'].otp;
    delete instance['dataValues'].verificationToken;
  }

  toJSON() {
    const attributes = super.toJSON();

    delete attributes.password;
    delete attributes.otp;
    delete attributes.verificationToken;

    return attributes;
  }
}
