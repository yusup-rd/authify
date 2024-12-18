import { IsEmail, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({
    description: 'New username for the user (optional)',
    required: false,
    example: 'newUsername123',
  })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({
    description: 'New email for the user (optional)',
    required: false,
    example: 'newemail@example.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Invalid email address format' })
  email?: string;
}
