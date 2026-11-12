module.exports = {
  preset: 'ts-jest',
  testMatch: ['<rootDir>/integration_tests/*.test.ts'],
  globalSetup: '<rootDir>/integration_tests/globalSetup.ts',
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  testTimeout: 10000,
  maxWorkers: 4,
};
