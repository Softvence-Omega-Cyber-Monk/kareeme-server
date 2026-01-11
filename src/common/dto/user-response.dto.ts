import { UserRole, UserStatus } from '@prisma';
import { Expose } from 'class-transformer';

export class UserResponseDto {
  @Expose()
  id: string;

  // ===== Identity =====
  @Expose()
  name: string;

  @Expose()
  email: string;

  @Expose()
  phone?: string;

  // ===== Settings =====
  @Expose()
  role: UserRole;

  @Expose()
  status: UserStatus;

  @Expose()
  isVerified: boolean;

  @Expose()
  isTFAEnabled?: boolean;

  // ===== Logout / activity tracking =====
  @Expose()
  lastLoginAt?: Date;

  @Expose()
  lastActiveAt?: Date;

  // ===== Avatar =====
  @Expose()
  profilePictureUrl?: string;

  // ===== Meta =====
  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
