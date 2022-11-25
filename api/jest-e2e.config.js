module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/e2e/*.test.ts'],
  verbose: true,
  forceExit: true,
  detectOpenHandles: true,
};
