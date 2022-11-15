import { Container } from '../../src/loaders/container.loader';
import { Generator } from '../../src/repositories/base/generator';
import { SocialService } from '../../src/services/social.service';
import { TestGenerator } from '../repositories/base/generator';
import { TestSocialService } from '../services/social.service';

export class TestConatiner extends Container {
  getGenerator(): Generator {
    if (!this.generator) {
      this.generator = new TestGenerator();
    }

    return this.generator;
  }

  getSocialService(): SocialService {
    if (!this.socialService) {
      this.socialService = new TestSocialService();
    }

    return this.socialService;
  }
}
