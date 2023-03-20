/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */

module.exports = {
    transform: {
        '^.+\\.ts?$': 'esbuild-jest',
    },
    clearMocks: true,
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageProvider: 'v8',
    testMatch: ['**/tests/unit/**/*.test.ts'],
};
process.env = Object.assign(process.env, {
    BASE_URL: 'https://url-shortener.example',
    GENERATED_LENGTH: 8
});
