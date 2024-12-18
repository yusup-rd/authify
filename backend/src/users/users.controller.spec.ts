import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dtos/update-user.dto';
import { ChangePasswordDto } from './dtos/change-password.dto';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: UsersService;

  const mockRequest = {
    user: { userId: 'user123' },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            getProfile: jest.fn(),
            updateProfile: jest.fn(),
            changePassword: jest.fn(),
          },
        },
      ],
    }).compile();

    usersController = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  describe('getProfile', () => {
    it('should return user profile successfully', async () => {
      const user = {
        id: 'user123',
        username: 'testuser',
        email: 'test@example.com',
      };

      jest.spyOn(usersService, 'getProfile').mockResolvedValue(user);

      const response = await usersController.getProfile(mockRequest);

      expect(usersService.getProfile).toHaveBeenCalledWith(
        mockRequest.user.userId,
      );
      expect(response).toEqual({
        message: 'User fetched successfully',
        user,
        status: 200,
      });
    });

    it('should throw NotFoundException if user does not exist', async () => {
      jest
        .spyOn(usersService, 'getProfile')
        .mockRejectedValue(new NotFoundException('User not found'));

      await expect(usersController.getProfile(mockRequest)).rejects.toThrow(
        new NotFoundException('User not found'),
      );
    });
  });

  describe('updateProfile', () => {
    it('should successfully update user profile', async () => {
      const updateUserDto: UpdateUserDto = {
        username: 'newuser',
        email: 'new@example.com',
      };
      const updatedUser = {
        id: 'user123',
        username: 'newuser',
        email: 'new@example.com',
      };

      jest.spyOn(usersService, 'updateProfile').mockResolvedValue(updatedUser);

      const response = await usersController.updateProfile(
        mockRequest,
        updateUserDto,
      );

      expect(usersService.updateProfile).toHaveBeenCalledWith(
        mockRequest.user.userId,
        updateUserDto,
      );
      expect(response).toEqual({
        message: 'Profile updated successfully',
        user: updatedUser,
        status: 200,
      });
    });

    it('should throw ConflictException if email or username is taken', async () => {
      jest
        .spyOn(usersService, 'updateProfile')
        .mockRejectedValue(new ConflictException('Email already taken'));

      await expect(
        usersController.updateProfile(mockRequest, {}),
      ).rejects.toThrow(new ConflictException('Email already taken'));
    });

    it('should throw BadRequestException if no changes are detected', async () => {
      jest
        .spyOn(usersService, 'updateProfile')
        .mockRejectedValue(new BadRequestException('No changes detected'));

      await expect(
        usersController.updateProfile(mockRequest, {}),
      ).rejects.toThrow(new BadRequestException('No changes detected'));
    });
  });

  describe('changePassword', () => {
    it('should successfully change user password', async () => {
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'oldPass123',
        newPassword: 'newPass456',
      };

      const updatedUser = {
        id: 'user123',
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashed-password',
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest.spyOn(usersService, 'changePassword').mockResolvedValue(updatedUser);

      const response = await usersController.changePassword(
        mockRequest,
        changePasswordDto,
      );

      expect(usersService.changePassword).toHaveBeenCalledWith(
        mockRequest.user.userId,
        changePasswordDto.currentPassword,
        changePasswordDto.newPassword,
      );
      expect(response).toEqual({
        message: 'Password changed successfully',
        user: updatedUser,
        status: 200,
      });
    });

    it('should throw NotFoundException if user does not exist', async () => {
      jest
        .spyOn(usersService, 'changePassword')
        .mockRejectedValue(new NotFoundException('User not found'));

      await expect(
        usersController.changePassword(mockRequest, {
          currentPassword: 'wrongPass123',
          newPassword: 'newPass456',
        }),
      ).rejects.toThrow(new NotFoundException('User not found'));
    });

    it('should throw BadRequestException for incorrect current password', async () => {
      jest
        .spyOn(usersService, 'changePassword')
        .mockRejectedValue(
          new BadRequestException('Incorrect current password'),
        );

      await expect(
        usersController.changePassword(mockRequest, {
          currentPassword: 'wrongPass123',
          newPassword: 'newPass456',
        }),
      ).rejects.toThrow(new BadRequestException('Incorrect current password'));
    });
  });
});
