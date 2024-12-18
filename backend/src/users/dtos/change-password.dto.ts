import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Current password for the user',
    minLength: 8,
    example: 'currentPassword123',
  })
  @IsString()
  @MinLength(8, {
    message: 'Current password must be at least 8 characters long.',
  })
  currentPassword: string;

  @ApiProperty({
    description: 'New password for the user',
    minLength: 8,
    example: 'newPassword456',
  })
  @IsString()
  @MinLength(8, { message: 'New password must be at least 8 characters long.' })
  newPassword: string;
}
