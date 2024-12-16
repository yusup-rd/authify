import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(
    username: string,
    email: string,
    password: string,
  ): Promise<{
    message: string;
    user: { id: string; username: string; email: string };
  }> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      username,
      email,
      password: hashedPassword,
    });

    try {
      const savedUser = await this.userRepository.save(user);

      const response = {
        message: 'Registration successful',
        user: {
          id: savedUser.id,
          username: savedUser.username,
          email: savedUser.email,
        },
        status: 200,
      };
      return response;
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException(
          'A user with this email or username already exists',
        );
      }
      throw error;
    }
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }

    throw new UnauthorizedException('Invalid email or password');
  }

  async login(
    email: string,
    password: string,
  ): Promise<{
    accessToken: string;
    user: { username: string; email: string; id: string };
  }> {
    const user = await this.validateUser(email, password);

    const payload = {
      username: user.username,
      email: user.email,
      sub: user.id,
    };
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'jwtsecret',
      expiresIn: '1h',
    });
    return {
      accessToken,
      user: { username: user.username, email: user.email, id: user.id },
    };
  }
}
