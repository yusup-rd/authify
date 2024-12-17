import { Controller, Get, UseGuards, Request, Put, Body } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dtos/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    const user = await this.usersService.getProfile(req.user.sub);
    return { message: 'User fetched successfully', user, status: 200 };
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    const userId = req.user.userId;
    const updatedUser = await this.usersService.updateProfile(
      userId,
      updateUserDto,
    );

    return {
      message: 'Profile updated successfully',
      user: updatedUser,
      status: 200,
    };
  }
}
