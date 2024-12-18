import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { ConflictException } from '@nestjs/common';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;
  let res: Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
            register: jest.fn(),
          },
        },
        JwtService,
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    res = {
      cookie: jest.fn().mockReturnThis(),
      send: jest.fn(),
      clearCookie: jest.fn(),
    } as unknown as Response;
  });

  describe('register', () => {
    it('should successfully register a user', async () => {
      const registerDto: RegisterDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Test@1234',
      };

      const result = {
        message: 'Registration successful',
        user: { id: '1', username: 'testuser', email: 'test@example.com' },
      };

      jest.spyOn(authService, 'register').mockResolvedValue(result);

      const response = await authController.register(registerDto);

      expect(authService.register).toHaveBeenCalledWith(
        registerDto.username,
        registerDto.email,
        registerDto.password,
      );
      expect(response).toEqual(result);
    });

    it('should throw a ConflictException if the user already exists', async () => {
      const registerDto: RegisterDto = {
        username: 'existinguser',
        email: 'existing@example.com',
        password: 'Test@1234',
      };

      jest
        .spyOn(authService, 'register')
        .mockRejectedValueOnce(new ConflictException('User already exists'));

      try {
        await authController.register(registerDto);
      } catch (e) {
        expect(e).toBeInstanceOf(ConflictException);
        expect(e.message).toBe('User already exists');
      }
    });
  });

  describe('login', () => {
    it('should successfully log in a user and set the cookie', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'Test@1234',
      };

      const accessToken = 'mock-token';

      jest.spyOn(authService, 'login').mockResolvedValue({
        accessToken,
        user: {
          username: 'testuser',
          email: 'test@example.com',
          id: '123',
        },
      });

      await authController.login(loginDto, res);

      expect(res.cookie).toHaveBeenCalledWith('accessToken', accessToken, {
        httpOnly: true,
        secure: true,
        maxAge: 60 * 60 * 1000,
        path: '/',
      });

      expect(res.send).toHaveBeenCalledWith({
        message: 'Login successful',
        accessToken,
        status: 200,
      });
    });

    it('should throw an error if login fails (invalid credentials)', async () => {
      const loginDto: LoginDto = {
        email: 'wrong@example.com',
        password: 'WrongPassword',
      };

      jest
        .spyOn(authService, 'login')
        .mockRejectedValue(new Error('Invalid credentials'));

      try {
        await authController.login(loginDto, res);
      } catch (error) {
        expect(error.message).toBe('Invalid credentials');
      }

      expect(res.send).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should clear the access token cookie', async () => {
      await authController.logout(res);

      expect(res.clearCookie).toHaveBeenCalledWith('accessToken', {
        httpOnly: true,
        secure: true,
        path: '/',
      });
      expect(res.send).toHaveBeenCalledWith({
        message: 'Logout successful',
        status: 200,
      });
    });
  });
});
