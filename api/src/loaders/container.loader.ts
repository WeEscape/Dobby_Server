'use strict';

import { AuthRepository } from '../repositories/auth.repository';
import { Generator } from '../repositories/base/generator';
import { RdbmsConfig } from '../repositories/base/rdbms.repository';
import { UsersRepository } from '../repositories/users.repository';
import { AuthService } from '../services/auth.service';
import { SocialService } from '../services/social.service';
import { UsersService } from '../services/users.service';

export class Container {
  protected generator: Generator;
  authRepository: AuthRepository;
  usersRepository: UsersRepository;
  socialService: SocialService;
  authService: AuthService;
  usersService: UsersService;

  constructor(private readonly rdbmsConfig: RdbmsConfig) {}

  getGenerator(): Generator {
    if (!this.generator) {
      this.generator = new Generator();
    }

    return this.generator;
  }

  getAuthRepository(): AuthRepository {
    if (!this.authRepository) {
      this.authRepository = new AuthRepository(this.rdbmsConfig, this.getGenerator());
    }

    return this.authRepository;
  }

  getUsersRepository(): UsersRepository {
    if (!this.usersRepository) {
      this.usersRepository = new UsersRepository(this.rdbmsConfig, this.getGenerator());
    }

    return this.usersRepository;
  }

  getSocialService(): SocialService {
    if (!this.socialService) {
      this.socialService = new SocialService();
    }

    return this.socialService;
  }

  getAuthService(): AuthService {
    if (!this.authService) {
      this.authService = new AuthService(this.getAuthRepository(), this.getSocialService());
    }

    return this.authService;
  }

  getUsersService(): UsersService {
    if (!this.usersService) {
      this.usersService = new UsersService(this.getUsersRepository());
    }

    return this.usersService;
  }
}
