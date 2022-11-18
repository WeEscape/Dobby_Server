module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/e2e/tasks.test.ts'],
  verbose: true,
  forceExit: true,
  detectOpenHandles: true,
};
