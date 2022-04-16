module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	testPathIgnorePatterns: ['dist'],
	setupFiles: ['./src/test/setup.ts'],
	resetMocks: true,
	detectOpenHandles: true,
};
