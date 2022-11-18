module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/repositories/*.repository.test.ts', '**/services/*.service.test.ts'],
  verbose: true,
  forceExit: true,
  detectOpenHandles: true,
};
