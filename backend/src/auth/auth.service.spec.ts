import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User } from '../entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

declare module 'bcrypt' {
  function compare(data: string, encrypted: string): Promise<boolean>;
  function hash(data: string, saltOrRounds: number): Promise<string>;
}

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('register', () => {
    it('should successfully register a user', async () => {
      const userDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Test@1234',
      };
      const hashedPassword = 'hashed-password';
      const mockUser = { ...userDto, password: hashedPassword, id: '1' };

      jest.spyOn(bcrypt, 'hash').mockResolvedValueOnce(hashedPassword);

      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      const result = await authService.register(
        userDto.username,
        userDto.email,
        userDto.password,
      );

      expect(bcrypt.hash).toHaveBeenCalledWith(userDto.password, 10);
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        username: userDto.username,
        email: userDto.email,
        password: hashedPassword,
      });
      expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual({
        message: 'Registration successful',
        user: {
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
        },
        status: 201,
      });
    });

    it('should throw a ConflictException if user already exists', async () => {
      const userDto = {
        username: 'existinguser',
        email: 'existing@example.com',
        password: 'Test@1234',
      };

      mockUserRepository.save.mockRejectedValueOnce({ code: '23505' });

      await expect(
        authService.register(userDto.username, userDto.email, userDto.password),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('validateUser', () => {
    it('should validate a user successfully', async () => {
      const email = 'test@example.com';
      const password = 'Test@1234';
      const mockUser = {
        id: '1',
        username: 'testuser',
        email,
        password: 'hashed-password',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true);

      const result = await authService.validateUser(email, password);

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(password, mockUser.password);
    });

    it('should throw UnauthorizedException if invalid credentials', async () => {
      const email = 'test@example.com';
      const password = 'WrongPassword';

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(authService.validateUser(email, password)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('login', () => {
    it('should successfully log in and return an access token', async () => {
      const email = 'test@example.com';
      const password = 'Test@1234';
      const mockUser = {
        id: '1',
        username: 'testuser',
        email,
        password: 'hashed-password',
      };
      const mockAccessToken = 'mock-access-token';

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true);
      (jwtService.sign as jest.Mock).mockReturnValue(mockAccessToken);

      const result = await authService.login(email, password);

      expect(result).toEqual({
        accessToken: mockAccessToken,
        user: { id: '1', username: 'testuser', email: 'test@example.com' },
      });
      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'testuser',
          email: 'test@example.com',
          sub: '1',
        }),
        { secret: 'jwtsecret', expiresIn: '1h' },
      );
    });

    it('should throw UnauthorizedException if invalid credentials during login', async () => {
      const email = 'wrong@example.com';
      const password = 'WrongPassword';

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(authService.login(email, password)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
