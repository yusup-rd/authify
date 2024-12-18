import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AuthModule } from './auth.module';
import { DataSource } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { testDbConfig } from '../../ormconfig.test';

describe('AuthController (Integration)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let userRepository;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRootAsync({
          useFactory: async () => testDbConfig,
        }),
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

  describe('POST /auth/register', () => {
    it('should successfully register a user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'Test@1234',
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        message: 'Registration successful',
        user: expect.objectContaining({
          username: 'testuser',
          email: 'test@example.com',
        }),
        status: 201,
      });

      const users = await userRepository.find();
      expect(users).toHaveLength(1);
      expect(users[0].username).toBe('testuser');
    });

    it('should not register a user with an existing email', async () => {
      await userRepository.save({
        username: 'testuser',
        email: 'test@example.com',
        password: await bcrypt.hash('Test@1234', 10),
      });

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'testuser2',
          email: 'test@example.com',
          password: 'Test@1234',
        });

      expect(response.status).toBe(409);
      expect(response.body.message).toBe(
        'A user with this email or username already exists',
      );
    });
  });

  describe('POST /auth/login', () => {
    it('should successfully log in a user', async () => {
      const user = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Test@1234',
      };

      await userRepository.save({
        ...user,
        password: await bcrypt.hash(user.password, 10),
      });

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: user.email,
          password: user.password,
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        message: 'Login successful',
        accessToken: expect.any(String),
        status: 201,
      });
    });

    it('should return 401 for invalid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'wrong@example.com',
          password: 'WrongPassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid email or password');
    });
  });
});
