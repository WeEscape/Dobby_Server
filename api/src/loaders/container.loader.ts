'use strict';

import { AuthRepository } from '../repositories/auth.repository';
import { Generator } from '../repositories/base/generator';
import { RdbmsConfig } from '../repositories/base/rdbms.repository';
import { AuthService } from '../services/auth.service';
import { SocialService } from '../services/social.service';

export class Container {
  protected generator: Generator;
  authRepository: AuthRepository;
  socialService: SocialService;
  authService: AuthService;

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
}
