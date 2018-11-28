'use strict';

module.exports = {
  collectCoverageFrom: [
    'src/*/**/*.js',
    '!**/flow-typed/**',
    '!**/node_modules/**',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/examples/',
    '\\.snap$'
  ],
  roots: [
    "<rootDir>/src"
  ],
  moduleDirectories: [
    "node_modules",
    "src",
  ],
  coverageReporters: ['json'],
  reporters: [
    ['jest-junit', {output: 'reports/junit/js-test-results.xml'}],
    ['jest-silent-reporter', {useDots: true}],
  ],
};