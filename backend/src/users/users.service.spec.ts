import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  HttpException,
} from '@nestjs/common';

describe('UsersService', () => {
  let usersService: UsersService;
  let userRepository: Repository<User>;

  const mockUserRepository = {
    findOne: jest.fn(),
    update: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('getProfile', () => {
    it('should return user profile without password', async () => {
      const userId = '1';
      const mockUser = {
        id: userId,
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashed-password',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await usersService.getProfile(userId);

      expect(result).toEqual({
        id: userId,
        username: 'testuser',
        email: 'test@example.com',
      });
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });

    it('should throw NotFoundException if user does not exist', async () => {
      const userId = '1';

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(usersService.getProfile(userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateProfile', () => {
    it('should successfully update the user profile', async () => {
      const userId = '1';
      const updateUserDto = {
        username: 'newUsername',
        email: 'new@example.com',
      };

      const mockUser = {
        id: userId,
        username: 'oldUsername',
        email: 'old@example.com',
        password: 'hashed-password',
      };

      const updatedUser = {
        id: userId,
        username: updateUserDto.username,
        email: updateUserDto.email,
      };

      mockUserRepository.findOne
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(updatedUser);

      mockUserRepository.update.mockResolvedValue(undefined);

      const result = await usersService.updateProfile(userId, updateUserDto);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });

      expect(mockUserRepository.update).toHaveBeenCalledWith(
        { id: userId },
        {
          username: updateUserDto.username,
          email: updateUserDto.email,
        },
      );

      expect(result).toEqual(updatedUser);
    });

    it('should throw ConflictException if email is already taken', async () => {
      const userId = '1';
      const updateUserDto = {
        username: 'newUsername',
        email: 'taken@example.com',
      };
      const mockUser = {
        id: userId,
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashed-password',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.findOne.mockResolvedValue({
        id: '2',
        email: 'taken@example.com',
      });

      await expect(
        usersService.updateProfile(userId, updateUserDto),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      const userId = '1';
      const updateUserDto = {
        username: 'newUsername',
        email: 'new@example.com',
      };

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        usersService.updateProfile(userId, updateUserDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if no changes detected', async () => {
      const userId = '1';
      const updateUserDto = { username: 'testuser', email: 'test@example.com' };
      const mockUser = {
        id: userId,
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashed-password',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(
        usersService.updateProfile(userId, updateUserDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('changePassword', () => {
    it('should change the user password successfully', async () => {
      const userId = '1';
      const currentPassword = 'Test@1234';
      const newPassword = 'New@1234';

      const mockUser = {
        id: userId,
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashed-password',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      jest.spyOn(bcrypt, 'hash').mockResolvedValue('new-hashed-password');

      mockUserRepository.save.mockResolvedValue({
        ...mockUser,
        password: 'new-hashed-password',
      });

      const result = await usersService.changePassword(
        userId,
        currentPassword,
        newPassword,
      );

      expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 10);

      expect(mockUserRepository.save).toHaveBeenCalledWith({
        ...mockUser,
        password: 'new-hashed-password',
      });

      expect(result).toEqual({
        ...mockUser,
        password: 'new-hashed-password',
      });
    });

    it('should throw HttpException if current password is incorrect', async () => {
      const userId = '1';
      const currentPassword = 'WrongPassword';
      const newPassword = 'New@1234';
      const mockUser = {
        id: userId,
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashed-password',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      await expect(
        usersService.changePassword(userId, currentPassword, newPassword),
      ).rejects.toThrow(HttpException);
    });

    it('should throw HttpException if user does not exist', async () => {
      const userId = '1';
      const currentPassword = 'Test@1234';
      const newPassword = 'New@1234';

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        usersService.changePassword(userId, currentPassword, newPassword),
      ).rejects.toThrow(HttpException);
    });
  });
});
