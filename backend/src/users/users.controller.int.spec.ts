import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt';

import { User } from '../entities/user.entity';
import { UsersModule } from './users.module';
import { AuthModule } from '../auth/auth.module';
import { testDbConfig } from '../../ormconfig.test';

describe('UsersController (Integration)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let userRepository;

  let token: string;
  let savedUser: User;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRootAsync({
          useFactory: async () => testDbConfig,
        }),
        UsersModule,
        AuthModule,
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    dataSource = module.get<DataSource>(DataSource);
    userRepository = dataSource.getRepository(User);
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  afterEach(async () => {
    await userRepository.clear();
  });

  beforeEach(async () => {
    const password = await bcrypt.hash('Test@1234', 10);

    savedUser = await userRepository.save({
      username: 'testuser',
      email: 'test@example.com',
      password,
    });

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Test@1234',
      });

    token = response.body.accessToken;
  });

  describe('GET /users/profile', () => {
    it('should successfully fetch user profile', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: 'User fetched successfully',
        user: expect.objectContaining({
          id: savedUser.id,
          username: 'testuser',
          email: 'test@example.com',
        }),
        status: 200,
      });
    });

    it('should return 401 for missing or invalid token', async () => {
      const response = await request(app.getHttpServer()).get('/users/profile');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });
  });

  describe('PUT /users/profile', () => {
    it('should successfully update user profile', async () => {
      const updatedData = {
        username: 'updateduser',
        email: 'updated@example.com',
      };

      const response = await request(app.getHttpServer())
        .put('/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .send(updatedData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: 'Profile updated successfully',
        user: expect.objectContaining(updatedData),
        status: 200,
      });

      const updatedUser = await userRepository.findOne({
        where: { id: savedUser.id },
      });
      expect(updatedUser.username).toBe('updateduser');
      expect(updatedUser.email).toBe('updated@example.com');
    });

    it('should return 400 if no changes are made', async () => {
      const response = await request(app.getHttpServer())
        .put('/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('No changes detected');
    });

    it('should return 409 if email is already taken', async () => {
      await userRepository.save({
        username: 'otheruser',
        email: 'duplicate@example.com',
        password: await bcrypt.hash('Test@1234', 10),
      });

      const response = await request(app.getHttpServer())
        .put('/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ email: 'duplicate@example.com' });

      expect(response.status).toBe(409);
      expect(response.body.message).toBe('Email already taken');
    });
  });

  describe('PUT /users/change-password', () => {
    it('should successfully change password', async () => {
      const response = await request(app.getHttpServer())
        .put('/users/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'Test@1234',
          newPassword: 'NewPassword@123',
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: 'Password changed successfully',
        user: expect.any(Object),
        status: 200,
      });

      const updatedUser = await userRepository.findOne({
        where: { id: savedUser.id },
      });
      const isPasswordValid = await bcrypt.compare(
        'NewPassword@123',
        updatedUser.password,
      );
      expect(isPasswordValid).toBeTruthy();
    });

    it('should return 400 for incorrect current password', async () => {
      const response = await request(app.getHttpServer())
        .put('/users/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'WrongPassword@123',
          newPassword: 'NewPassword@123',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Incorrect current password');
    });

    it('should return 401 for missing or invalid token', async () => {
      const response = await request(app.getHttpServer())
        .put('/users/change-password')
        .send({
          currentPassword: 'Test@1234',
          newPassword: 'NewPassword@123',
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });
  });
});
