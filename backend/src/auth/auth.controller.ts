import { Controller, Post, Body, Response } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: RegisterDto) {
    const { password, ...rest } = body;

    return await this.authService.register(rest.username, rest.email, password);
  }

  @Post('login')
  async login(@Body() body: LoginDto, @Response() res) {
    const { email, password } = body;

    const { accessToken } = await this.authService.login(email, password);

    res
      .cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: true,
        maxAge: 60 * 60 * 1000,
        path: '/',
      })
      .send({
        message: 'Login successful',
        accessToken,
        status: 201,
      });
  }

  @Post('logout')
  async logout(@Response() res) {
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: true,
      path: '/',
    });

    res.send({ message: 'Logout successful', status: 200 });
  }
}
