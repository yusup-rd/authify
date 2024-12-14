import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dtos/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: RegisterDto) {
    const { password, ...rest } = body;

    if (password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters');
    }
    
    return await this.authService.register(rest.username, rest.email, password);
  }
}
