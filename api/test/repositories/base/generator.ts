import { Generator } from '../../../src/repositories/base/generator';

export class TestGenerator extends Generator {
  count: number = 1;

  private generateExpiredAtInSec(sec: number) {
    const expiredAt = new Date();
    expiredAt.setSeconds(expiredAt.getSeconds() + sec);

    return expiredAt;
  }

  generateRandomString(length: number) {
    const randomString = new Array(length).fill(this.count).join('');
    this.count += 1;

    return randomString;
  }

  resetCount(): void {
    this.count = 1;
  }

  generatePhoneNumberCodeExpiredAt(): Date {
    return this.generateExpiredAtInSec(1);
  }

  generatePasswordCodeExpiredAt(): Date {
    return this.generateExpiredAtInSec(1);
  }

  generateRefreshTokenExpiredAt(): Date {
    return this.generateExpiredAtInSec(1);
  }
}
