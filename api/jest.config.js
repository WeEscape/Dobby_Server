module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/repositories/*.test.ts', '**/services/*.test.ts'],
  verbose: true,
  forceExit: true,
  detectOpenHandles: true,
};
