import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from './src/entities/user.entity';

export const testDbConfig: TypeOrmModuleOptions = {
  type: 'sqlite',
  database: ':memory:',
  entities: [User],
  synchronize: true,
  logging: false,
};
