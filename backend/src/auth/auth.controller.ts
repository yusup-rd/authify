import { Controller, Post, Body, Response } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'The user has been successfully registered.' })
  @ApiResponse({ status: 409, description: 'User with email or username already exists.' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @Post('register')
  async register(@Body() body: RegisterDto) {
    const { password, ...rest } = body;

    return await this.authService.register(rest.username, rest.email, password);
  }

  @ApiOperation({ summary: 'Log in an existing user' })
  @ApiResponse({ status: 201, description: 'User login successful.' })
  @ApiResponse({ status: 401, description: 'Invalid email or password.' })
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

  @ApiOperation({ summary: 'Log out the user' })
  @ApiResponse({ status: 200, description: 'Logout successful.' })
  @ApiBearerAuth()
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
