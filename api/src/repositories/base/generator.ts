export class Generator {
  /** 랜덤 문자열 생성 */
  generateRandomString(length: number) {
    return Math.random()
      .toString()
      .substring(2, 2 + length);
  }

  /** refresh token 유효기간 생성 */
  generateRefreshTokenExpiredAt(): Date {
    const refreshTokenExpiredAt = new Date();
    refreshTokenExpiredAt.setDate(refreshTokenExpiredAt.getDate() + 14);

    return refreshTokenExpiredAt;
  }
}
