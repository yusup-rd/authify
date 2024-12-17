import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UpdateUserDto } from './dtos/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getProfile(userId: string): Promise<Partial<User>> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password, ...userProfile } = user;
    return userProfile;
  }

  async updateProfile(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<Partial<User>> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { email, username } = updateUserDto;

    const updates: Partial<User> = {};

    if (email && email !== user.email) {
      const emailConflict = await this.userRepository.findOne({
        where: { email, id: Not(userId) },
      });
      if (emailConflict) {
        throw new ConflictException('Email already taken');
      }
      updates.email = email;
    }

    if (username && username !== user.username) {
      const usernameConflict = await this.userRepository.findOne({
        where: { username, id: Not(userId) },
      });
      if (usernameConflict) {
        throw new ConflictException('Username already taken');
      }
      updates.username = username;
    }

    if (Object.keys(updates).length === 0) {
      throw new BadRequestException('No changes detected');
    }

    await this.userRepository.update({ id: userId }, updates);

    return await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'username', 'email'],
    });
  }
}
